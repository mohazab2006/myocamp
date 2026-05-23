"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import { fetchCampBySlug } from "@/lib/admin/camps";
import {
  buildClaimUrl,
  createWaitlistEntry,
  expireOverdueClaims,
  fetchWaitlistEntryById,
  moveWaitlistPosition,
  promoteWaitlistEntry,
  reactivateWaitlistEntry,
  removeWaitlistEntry,
  unpromoteWaitlistEntry
} from "@/lib/admin/waitlist";
import { notify } from "@/lib/email/notifications";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function optional(formData: FormData, key: string) {
  const v = value(formData, key);
  return v === "" ? null : v;
}
function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

function tabUrl(slug: string) {
  return `/admin/camps/${slug}?tab=waitlist`;
}

// ---------------------------------------------------------------------------
// Add to waitlist manually (admin)
// ---------------------------------------------------------------------------

export async function createManualWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const camp = await fetchCampBySlug(slug);
  if (!camp) flash("/admin/camps", "error", "Camp not found.");

  const parentName = optional(formData, "parentName");
  const parentEmail = optional(formData, "parentEmail");
  const parentPhone = optional(formData, "parentPhone");
  const camperName = optional(formData, "camperName");

  if (!parentName && !parentEmail) {
    flash(tabUrl(slug), "error", "Add at least a parent name or email.");
  }

  try {
    await createWaitlistEntry({
      campId: camp!.id,
      parentName,
      parentEmail,
      parentPhone,
      camperName
    });
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not add to waitlist.");
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath("/admin/camps");
  flash(tabUrl(slug), "success", `Added ${parentName ?? parentEmail} to the waitlist.`);
}

// ---------------------------------------------------------------------------
// Promote (open the top spot to this family with a 48h claim link)
// ---------------------------------------------------------------------------

export async function promoteWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  const ttlRaw = value(formData, "ttlHours");
  const ttlHours = ttlRaw ? Number(ttlRaw) : 48;
  const camp = await fetchCampBySlug(slug);
  if (!camp) flash(tabUrl(slug), "error", "Camp not found.");

  if (!id) flash(tabUrl(slug), "error", "Missing waitlist id.");

  let entryWithToken;
  try {
    entryWithToken = await promoteWaitlistEntry(id, {
      ttlHours: Number.isFinite(ttlHours) ? ttlHours : 48
    });
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not promote.");
  }

  // Send waitlist_promoted email with the claim link (best-effort).
  let emailNote = "";
  try {
    const entry = entryWithToken ?? (await fetchWaitlistEntryById(id));
    if (entry?.claimToken && entry.parentEmail) {
      const claimUrl = buildClaimUrl(slug, entry.claimToken);
      const result = await notify.waitlistPromoted({
        camp: camp!,
        entry,
        claimUrl,
        claimWindow: `${ttlHours} hours`
      });
      emailNote = result.ok ? " Email sent to parent." : ` (email skipped — ${result.reason ?? "see Inbox"}).`;
    } else if (entry && !entry.parentEmail) {
      emailNote = " (no email on file — copy the claim link manually).";
    }
  } catch (err) {
    console.warn("[promoteWaitlistAction] notify failed:", err);
    emailNote = " (email failed to send — copy the claim link manually).";
  }

  revalidatePath(`/admin/camps/${slug}`);
  flash(
    tabUrl(slug),
    "success",
    `Promoted. Expires in ${ttlHours} hr.${emailNote}`
  );
}

export async function unpromoteWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  if (!id) flash(tabUrl(slug), "error", "Missing waitlist id.");

  try {
    await unpromoteWaitlistEntry(id);
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not undo.");
  }
  revalidatePath(`/admin/camps/${slug}`);
  flash(tabUrl(slug), "success", "Promotion rolled back.");
}

// ---------------------------------------------------------------------------
// Remove / reactivate / reorder
// ---------------------------------------------------------------------------

export async function removeWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  if (!id) flash(tabUrl(slug), "error", "Missing waitlist id.");

  try {
    await removeWaitlistEntry(id);
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not remove.");
  }
  revalidatePath(`/admin/camps/${slug}`);
  flash(tabUrl(slug), "success", "Removed from waitlist.");
}

export async function reactivateWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  if (!id) flash(tabUrl(slug), "error", "Missing waitlist id.");

  try {
    await reactivateWaitlistEntry(id);
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not reactivate.");
  }
  revalidatePath(`/admin/camps/${slug}`);
  flash(tabUrl(slug), "success", "Re-added to active waitlist.");
}

export async function moveWaitlistAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  const direction = value(formData, "direction") as "up" | "down";
  if (!id) flash(tabUrl(slug), "error", "Missing waitlist id.");
  if (direction !== "up" && direction !== "down") {
    flash(tabUrl(slug), "error", "Bad direction.");
  }

  try {
    await moveWaitlistPosition(id, direction);
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Could not reorder.");
  }
  revalidatePath(`/admin/camps/${slug}`);
  flash(tabUrl(slug), "success", "Position updated.");
}

// ---------------------------------------------------------------------------
// Expire stale promotions on demand
// ---------------------------------------------------------------------------

export async function expireOverdueClaimsAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");

  try {
    const { expired } = await expireOverdueClaims();
    revalidatePath(`/admin/camps/${slug}`);
    flash(
      tabUrl(slug),
      expired > 0 ? "success" : "info",
      expired === 0
        ? "No promotions are overdue."
        : `Expired ${expired} stale claim${expired === 1 ? "" : "s"}.`
    );
  } catch (err) {
    flash(tabUrl(slug), "error", err instanceof Error ? err.message : "Sweep failed.");
  }
}
