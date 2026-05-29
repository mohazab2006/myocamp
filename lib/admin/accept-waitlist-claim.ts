import "server-only";

import { fetchCampBySlug } from "@/lib/admin/camps";
import { buildPaymentUrl } from "@/lib/admin/payment-links";
import { createRegistrationWithInvoice } from "@/lib/admin/registrations";
import { findWaitlistByClaimToken, markWaitlistClaimed } from "@/lib/admin/waitlist";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AcceptWaitlistClaimResult =
  | { ok: true; referenceCode: string; paymentUrl: string; alreadyClaimed?: boolean }
  | { ok: false; status: "invalid" | "expired" | "already-claimed" | "error"; message: string };

export async function acceptWaitlistClaim(input: {
  slug: string;
  token: string;
  camperName?: string | null;
  origin: string;
}): Promise<AcceptWaitlistClaimResult> {
  const { slug, token, camperName, origin } = input;
  if (!token || !slug) {
    return { ok: false, status: "invalid", message: "Missing claim link." };
  }

  const entry = await findWaitlistByClaimToken(token);
  if (!entry) {
    return { ok: false, status: "invalid", message: "This claim link is not valid." };
  }

  if (entry.status === "claimed") {
    const paymentUrl = await paymentUrlForClaimedEntry(entry.claimedRegistrationId, origin);
    if (paymentUrl) {
      return {
        ok: true,
        referenceCode: paymentUrl.split("/").pop()?.split("?")[0] ?? "",
        paymentUrl,
        alreadyClaimed: true
      };
    }
    return { ok: false, status: "already-claimed", message: "This spot is already confirmed." };
  }

  if (entry.status === "expired") {
    return { ok: false, status: "expired", message: "This claim window has closed." };
  }

  if (entry.status !== "promoted") {
    return { ok: false, status: "invalid", message: "This claim link is not active." };
  }

  if (entry.claimExpiresAt && new Date(entry.claimExpiresAt).getTime() < Date.now()) {
    return { ok: false, status: "expired", message: "This claim window has closed." };
  }

  const camp = await fetchCampBySlug(slug);
  if (!camp || camp.id !== entry.campId) {
    return { ok: false, status: "invalid", message: "Camp not found for this claim." };
  }

  try {
    const resolvedCamperName = entry.camperName ?? camperName?.trim() ?? null;
    const result = await createRegistrationWithInvoice({
      campId: camp.id,
      campStartYear: new Date(camp.startDate).getUTCFullYear(),
      feePerCamper: camp.feePerCamper,
      source: "waitlist_claim",
      jotformSubmissionId: null,
      parentName: entry.parentName,
      parentEmail: entry.parentEmail,
      parentPhone: entry.parentPhone,
      campers: resolvedCamperName ? [{ name: resolvedCamperName }] : [],
      rawPayload: {
        _waitlistClaim: true,
        waitlistEntryId: entry.id,
        promotedFromWaitlistId: entry.id
      },
      notes: "Promoted from waitlist"
    });

    await markWaitlistClaimed(entry.id, result.registration.id);

    const ctx = await loadRegistrationContextByInvoice(result.invoice.id);
    if (ctx) {
      try {
        await notify.registrationReceived({ ...ctx, origin });
      } catch (err) {
        console.warn("[acceptWaitlistClaim] notify.registrationReceived failed:", err);
      }
    }

    const paymentUrl = buildPaymentUrl(result.invoice.referenceCode, origin);
    return {
      ok: true,
      referenceCode: result.invoice.referenceCode,
      paymentUrl
    };
  } catch (err) {
    console.error("[acceptWaitlistClaim] error:", err);
    return {
      ok: false,
      status: "error",
      message: err instanceof Error ? err.message : "Could not confirm this spot."
    };
  }
}

async function paymentUrlForClaimedEntry(
  registrationId: string | null,
  origin: string
): Promise<string | null> {
  if (!registrationId) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("invoices")
    .select("reference_code")
    .eq("registration_id", registrationId)
    .maybeSingle();
  const ref = (data as { reference_code: string } | null)?.reference_code;
  if (!ref) return null;
  return buildPaymentUrl(ref, origin);
}
