"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveCamp,
  createCamp,
  deleteCampHard,
  fetchCampBySlug,
  updateCamp,
  type UpsertCampInput
} from "@/lib/admin/camps";
import { reopenCampRegistration } from "@/lib/admin/camp-capacity";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import type { Camp } from "@/lib/types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string) {
  const v = value(formData, key);
  return v === "" ? null : v;
}

function numberOrNull(formData: FormData, key: string): number | null {
  const v = value(formData, key);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

function parseInput(formData: FormData): { input: UpsertCampInput; error?: string } {
  const title = value(formData, "title");
  const startDate = value(formData, "startDate");
  const endDate = value(formData, "endDate");
  const status = (value(formData, "status") || "draft") as Camp["status"];

  if (!title || !startDate || !endDate) {
    return {
      input: {} as UpsertCampInput,
      error: "Camp needs a title, start date, and end date."
    };
  }

  const slug = value(formData, "slug") || slugify(title);
  const feeRaw = value(formData, "feePerCamper");
  const fee = feeRaw === "" ? 0 : Number(feeRaw);

  if (!Number.isFinite(fee) || fee < 0) {
    return { input: {} as UpsertCampInput, error: "Fee per camper must be a positive number." };
  }

  return {
    input: {
      slug,
      title,
      status,
      capacity: numberOrNull(formData, "capacity"),
      startDate,
      endDate,
      location: optional(formData, "location"),
      feePerCamper: fee,
      registrationFormJotformId: optional(formData, "registrationFormJotformId"),
      waitlistFormJotformId: optional(formData, "waitlistFormJotformId"),
      registrationClosesAt: optional(formData, "registrationClosesAt"),
      autoCloseAtCapacity: formData.get("autoCloseAtCapacity") === "on",
      paymentEmail: optional(formData, "paymentEmail"),
      heroImage: optional(formData, "heroImage"),
      featuredOnEvents: formData.get("featuredOnEvents") === "on",
      notes: optional(formData, "notes")
    }
  };
}

export async function createCampAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const { input, error } = parseInput(formData);
  if (error) flash("/admin/camps/new", "error", error);

  let camp;
  try {
    camp = await createCamp(input);
  } catch (err) {
    flash(
      "/admin/camps/new",
      "error",
      err instanceof Error ? err.message : "Could not create camp."
    );
  }

  revalidatePath("/admin/camps");
  revalidatePath(`/admin/camps/${camp.slug}`);
  revalidatePath("/admin");
  revalidatePath("/camp/register");
  revalidatePath(`/camp/${camp.slug}/register`);
  revalidatePath("/events");
  flash(`/admin/camps/${camp.slug}`, "success", `Created "${camp.title}".`);
}

export async function updateCampAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const id = value(formData, "id");
  const originalSlug = value(formData, "originalSlug");
  if (!id) flash("/admin/camps", "error", "Missing camp id.");

  const { input, error } = parseInput(formData);
  if (error) flash(`/admin/camps/${originalSlug || ""}/edit`, "error", error);

  let camp;
  try {
    camp = await updateCamp(id, input);
  } catch (err) {
    flash(
      `/admin/camps/${originalSlug || ""}/edit`,
      "error",
      err instanceof Error ? err.message : "Could not update camp."
    );
  }

  revalidatePath("/admin/camps");
  revalidatePath(`/admin/camps/${originalSlug}`);
  revalidatePath(`/admin/camps/${camp.slug}`);
  revalidatePath("/admin");
  revalidatePath("/camp/register");
  revalidatePath(`/camp/${camp.slug}/register`);
  revalidatePath("/events");
  flash(`/admin/camps/${camp.slug}`, "success", `Saved "${camp.title}".`);
}

export async function archiveCampAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const id = value(formData, "id");
  const slug = value(formData, "slug");
  if (!id) flash("/admin/camps", "error", "Missing camp id.");

  try {
    await archiveCamp(id);
  } catch (err) {
    flash(
      `/admin/camps/${slug}`,
      "error",
      err instanceof Error ? err.message : "Could not archive camp."
    );
  }

  revalidatePath("/admin/camps");
  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath("/admin");
  flash("/admin/camps", "success", "Camp archived.");
}

export async function deleteCampAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const id = value(formData, "id");
  const slug = value(formData, "slug");
  if (!id) flash("/admin/camps", "error", "Missing camp id.");

  // Safety: confirm there's no data we'd nuke. If there is, refuse and tell the
  // owner to archive instead.
  const existing = slug ? await fetchCampBySlug(slug) : null;
  if (existing && existing.status !== "archived" && existing.status !== "draft") {
    flash(
      `/admin/camps/${slug}`,
      "error",
      "Active camps can't be hard-deleted. Archive it first, or change its status to Draft."
    );
  }

  try {
    await deleteCampHard(id);
  } catch (err) {
    flash(
      `/admin/camps/${slug}`,
      "error",
      err instanceof Error ? err.message : "Could not delete camp."
    );
  }

  revalidatePath("/admin/camps");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
  flash("/admin/camps", "success", "Camp deleted.");
}

export async function reopenCampAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const id = value(formData, "id");
  const slug = value(formData, "slug");
  if (!id || !slug) flash("/admin/camps", "error", "Missing camp.");

  try {
    const { changed, status } = await reopenCampRegistration(id);
    if (!changed) {
      flash(`/admin/camps/${slug}`, "info", "Camp is not closed — nothing to reopen.");
    }

    revalidatePath("/admin/camps");
    revalidatePath(`/admin/camps/${slug}`);
    revalidatePath("/admin");
    revalidatePath("/camp/register");
    revalidatePath(`/camp/${slug}/register`);
    revalidatePath("/events");
    flash(
      `/admin/camps/${slug}`,
      "success",
      status === "full"
        ? "Registration reopened — camp is at capacity so status is Full (waitlist only)."
        : "Registration reopened. Auto-close deadline cleared so cron won't close it again."
    );
  } catch (err) {
    flash(
      `/admin/camps/${slug}`,
      "error",
      err instanceof Error ? err.message : "Could not reopen camp."
    );
  }
}
