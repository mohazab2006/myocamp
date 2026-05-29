"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import {
  dismissUnrelatedInboundEmails,
  fetchInboundEmailById,
  markInboundEmailNotPayment,
  matchInboundEmailToInvoice,
  reconcileOrphanedInboundMatches
} from "@/lib/admin/inbound-emails";
import { findByReferenceCode } from "@/lib/admin/payment-links";

function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function matchInboundEmailAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const inboundId = value(formData, "inboundId");
  const referenceCode = value(formData, "referenceCode").toUpperCase();

  if (!inboundId) flash("/admin/inbox", "error", "Missing inbound id.");
  if (!referenceCode) flash("/admin/inbox", "error", "Pick a reference code to match.");

  const lookup = await findByReferenceCode(referenceCode);
  if (!lookup) {
    flash("/admin/inbox", "error", `No invoice found for ${referenceCode}.`);
  }

  try {
    await matchInboundEmailToInvoice(inboundId, lookup!.invoice.id, null);
  } catch (err) {
    flash("/admin/inbox", "error", err instanceof Error ? err.message : "Could not match.");
  }

  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/camps/${lookup!.camp.slug}`);
  flash(
    "/admin/inbox",
    "success",
    `Matched email to ${referenceCode} (${lookup!.registration.parentName ?? "registration"}).`
  );
}

export async function markNotPaymentAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const inboundId = value(formData, "inboundId");
  if (!inboundId) flash("/admin/inbox", "error", "Missing inbound id.");

  // Sanity check the email exists.
  const email = await fetchInboundEmailById(inboundId);
  if (!email) flash("/admin/inbox", "error", "Email not found.");

  try {
    await markInboundEmailNotPayment(inboundId);
  } catch (err) {
    flash("/admin/inbox", "error", err instanceof Error ? err.message : "Could not update.");
  }

  revalidatePath("/admin/inbox");
  flash("/admin/inbox", "success", "Marked as not a payment.");
}

export async function dismissUnrelatedInboundAction() {
  await requireAuthorizedAdmin();
  try {
    const n = await dismissUnrelatedInboundEmails();
    revalidatePath("/admin/inbox");
    flash(
      "/admin/inbox?tab=unmatched",
      "success",
      n > 0
        ? `Cleared ${n} personal e-Transfer${n === 1 ? "" : "s"} (no camp reference).`
        : "No unrelated e-Transfers to clear."
    );
  } catch (err) {
    flash(
      "/admin/inbox?tab=unmatched",
      "error",
      err instanceof Error ? err.message : "Could not clear inbox."
    );
  }
}

export async function clearStaleMatchedAction() {
  await requireAuthorizedAdmin();
  try {
    const n = await reconcileOrphanedInboundMatches();
    revalidatePath("/admin/inbox");
    flash(
      "/admin/inbox?tab=matched",
      "success",
      n > 0
        ? `Cleared ${n} stale auto-match${n === 1 ? "" : "es"} (camp or invoice was removed).`
        : "No stale auto-matches to clear."
    );
  } catch (err) {
    flash(
      "/admin/inbox?tab=matched",
      "error",
      err instanceof Error ? err.message : "Could not clear stale matches."
    );
  }
}
