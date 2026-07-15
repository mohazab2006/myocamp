"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import {
  dismissInboundEmailFromQueue,
  dismissUnrelatedInboundEmails,
  fetchInboundEmailById,
  markInboundEmailNotPayment,
  matchInboundEmailToInvoice,
  reconcileOrphanedInboundMatches,
  updateInboundEmailMatch
} from "@/lib/admin/inbound-emails";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

export async function removeInboundFromQueueAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const inboundId = value(formData, "inboundId");
  const tab = value(formData, "tab") || "unmatched";
  if (!inboundId) flash(`/admin/inbox?tab=${tab}`, "error", "Missing inbound id.");

  try {
    await dismissInboundEmailFromQueue(inboundId);
  } catch (err) {
    flash(
      `/admin/inbox?tab=${tab}`,
      "error",
      err instanceof Error ? err.message : "Could not remove."
    );
  }

  revalidatePath("/admin/inbox");
  flash(
    `/admin/inbox?tab=${tab}`,
    "success",
    "Removed from Needs match. It stays in All for your records."
  );
}

export async function dismissUnrelatedInboundAction() {
  await requireAuthorizedAdmin();

  let outcome: { type: "success" | "error"; message: string };
  try {
    const n = await dismissUnrelatedInboundEmails();
    revalidatePath("/admin/inbox");
    outcome = {
      type: "success",
      message:
        n > 0
          ? `Cleared ${n} personal e-Transfer${n === 1 ? "" : "s"} (no camp reference).`
          : "No unrelated e-Transfers to clear."
    };
  } catch (err) {
    outcome = { type: "error", message: err instanceof Error ? err.message : "Could not clear inbox." };
  }

  flash("/admin/inbox?tab=unmatched", outcome.type, outcome.message);
}

/**
 * Re-link an inbox email that was wrongly marked as "not_payment" by the
 * reconcile bug (multi-ref-code e-transfers). Finds the payment already
 * recorded via this email's Gmail message ID and re-links it.
 */
export async function relinkOrphanedMatchAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const inboundId = value(formData, "inboundId");
  if (!inboundId) flash("/admin/inbox?tab=all", "error", "Missing inbound id.");

  const email = await fetchInboundEmailById(inboundId);
  if (!email) flash("/admin/inbox?tab=all", "error", "Email not found.");

  const supabase = createSupabaseAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("external_ref", email!.gmailMessageId)
    .maybeSingle();

  if (!payment) {
    flash(
      "/admin/inbox?tab=all",
      "error",
      "No payment found for this email — the payment may not have been recorded yet. Match it manually from Needs match."
    );
  }

  try {
    await updateInboundEmailMatch(inboundId, {
      matchStatus: "matched",
      matchedPaymentId: (payment as { id: string }).id,
      errorMessage: null
    });
  } catch (err) {
    flash("/admin/inbox?tab=all", "error", err instanceof Error ? err.message : "Could not re-link.");
  }

  revalidatePath("/admin/inbox");
  flash("/admin/inbox?tab=matched", "success", "Re-linked to the existing payment record.");
}

export async function clearStaleMatchedAction() {
  await requireAuthorizedAdmin();

  let outcome: { type: "success" | "error"; message: string };
  try {
    const n = await reconcileOrphanedInboundMatches();
    revalidatePath("/admin/inbox");
    outcome = {
      type: "success",
      message:
        n > 0
          ? `Cleared ${n} stale auto-match${n === 1 ? "" : "es"} (camp or invoice was removed).`
          : "No stale auto-matches to clear."
    };
  } catch (err) {
    outcome = { type: "error", message: err instanceof Error ? err.message : "Could not clear stale matches." };
  }

  flash("/admin/inbox?tab=matched", outcome.type, outcome.message);
}
