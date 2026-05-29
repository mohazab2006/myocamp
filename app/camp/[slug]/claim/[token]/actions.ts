"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fetchCampBySlug } from "@/lib/admin/camps";
import { createRegistrationWithInvoice } from "@/lib/admin/registrations";
import { findWaitlistByClaimToken, markWaitlistClaimed } from "@/lib/admin/waitlist";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Public claim acceptance action.
 *
 * Validates the token, converts the waitlist entry into a real registration +
 * invoice, marks the waitlist row `claimed`, and redirects the parent straight
 * to /camp/pay/[ref] so they can pay immediately.
 */
export async function acceptClaimAction(formData: FormData) {
  const token = value(formData, "token");
  const slug = value(formData, "slug");
  if (!token || !slug) redirect("/camp");

  const entry = await findWaitlistByClaimToken(token);
  if (!entry) {
    redirect(`/camp/${slug}/claim/${token}?status=invalid`);
  }

  if (entry!.status === "claimed") {
    redirect(`/camp/${slug}/claim/${token}?status=already-claimed`);
  }
  if (entry!.status === "expired") {
    redirect(`/camp/${slug}/claim/${token}?status=expired`);
  }
  if (entry!.status !== "promoted") {
    redirect(`/camp/${slug}/claim/${token}?status=invalid`);
  }

  // Expiry check (in case the cron sweep hasn't fired yet).
  if (entry!.claimExpiresAt && new Date(entry!.claimExpiresAt).getTime() < Date.now()) {
    redirect(`/camp/${slug}/claim/${token}?status=expired`);
  }

  const camp = await fetchCampBySlug(slug);
  if (!camp || camp.id !== entry!.campId) redirect("/camp");

  try {
    const camperName = entry!.camperName ?? value(formData, "camperName") ?? null;
    const result = await createRegistrationWithInvoice({
      campId: camp.id,
      campStartYear: new Date(camp.startDate).getUTCFullYear(),
      feePerCamper: camp.feePerCamper,
      source: "waitlist_claim",
      jotformSubmissionId: null,
      parentName: entry!.parentName,
      parentEmail: entry!.parentEmail,
      parentPhone: entry!.parentPhone,
      campers: camperName ? [{ name: camperName }] : [],
      rawPayload: {
        _waitlistClaim: true,
        waitlistEntryId: entry!.id,
        promotedFromWaitlistId: entry!.id
      },
      notes: "Promoted from waitlist"
    });

    await markWaitlistClaimed(entry!.id, result.registration.id);

    const ctx = await loadRegistrationContextByInvoice(result.invoice.id);
    if (ctx) {
      const hdrs = await headers();
      const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "myo.camp";
      const proto =
        hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      const origin = `${proto}://${host}`;
      void notify.registrationReceived({ ...ctx, origin }).catch((err) => {
        console.warn("[acceptClaimAction] notify.registrationReceived failed:", err);
      });
    }

    revalidatePath(`/admin/camps/${camp.slug}`);
    revalidatePath("/admin/camps");
    revalidatePath(`/camp/${slug}/claim/${token}`);

    redirect(`/camp/pay/${result.invoice.referenceCode}?claimed=1`);
  } catch (err) {
    console.error("[acceptClaimAction] error:", err);
    redirect(`/camp/${slug}/claim/${token}?status=error`);
  }
}
