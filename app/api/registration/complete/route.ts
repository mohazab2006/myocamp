import { NextResponse, type NextRequest } from "next/server";

import { lookupJotformSubmissionOutcome } from "@/lib/admin/jotform-complete";
import { buildPaymentUrl } from "@/lib/admin/payment-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/registration/complete?sid=JOTFORM_SUBMISSION_ID
 *
 * Polled by /camp/.../register/complete after JotForm redirects the parent here.
 * Returns pending until the webhook has created the registration / waitlist row.
 */
export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sid")?.trim();
  if (!sid) {
    return NextResponse.json({ ok: false, error: "Missing sid" }, { status: 400 });
  }

  const outcome = await lookupJotformSubmissionOutcome(sid);
  if (!outcome) {
    return NextResponse.json({ ok: true, status: "pending" as const });
  }

  const origin = req.nextUrl.origin;

  if (outcome.kind === "waitlist") {
    return NextResponse.json({
      ok: true,
      status: "ready" as const,
      kind: "waitlist" as const,
      campTitle: outcome.camp.title,
      campSlug: outcome.camp.slug,
      position: outcome.position,
      registerUrl: `${origin}/camp/${outcome.camp.slug}/register`
    });
  }

  const paymentUrl = buildPaymentUrl(outcome.invoice.referenceCode, origin);

  return NextResponse.json({
    ok: true,
    status: "ready" as const,
    kind: "registration" as const,
    campTitle: outcome.camp.title,
    campSlug: outcome.camp.slug,
    referenceCode: outcome.invoice.referenceCode,
    amountDue: outcome.invoice.amountDue,
    paymentUrl
  });
}
