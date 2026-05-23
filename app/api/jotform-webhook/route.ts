import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseJotformWebhook } from "@/lib/admin/jotform";
import { createRegistrationWithInvoice } from "@/lib/admin/registrations";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/jotform-webhook
 *
 * JotForm posts each submission here as multipart/form-data. We:
 *   1. Optionally verify a shared secret (?secret=… or x-jotform-secret header)
 *   2. Read formID and look up which camp owns that form (registration OR waitlist)
 *   3. Parse rawRequest into parent + camper fields (heuristic, see lib/admin/jotform.ts)
 *   4. For registration forms → create registration + invoice with a unique reference code
 *      For waitlist forms     → create a waitlist_entries row
 *   5. Return 200 even on no-match / duplicate so JotForm doesn't retry forever.
 *      Hard errors return 500 to trigger JotForm's retry.
 *
 * Idempotent: re-posting the same submissionID is a no-op.
 */
export async function POST(req: NextRequest) {
  try {
    if (!verifySecret(req)) {
      return NextResponse.json({ ok: false, error: "Invalid webhook secret" }, { status: 401 });
    }

    const formData = await req.formData();
    const body: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      body[key] = typeof value === "string" ? value : "";
    }

    const parsed = parseJotformWebhook(body);

    if (!parsed.formId) {
      return NextResponse.json({ ok: false, error: "Missing formID" }, { status: 400 });
    }

    const camp = await lookupCampByFormId(parsed.formId);

    if (!camp) {
      // Log + accept so JotForm doesn't keep retrying.
      console.warn(
        `[jotform-webhook] No camp matches formID=${parsed.formId} submissionID=${parsed.submissionId}. Configure the form in /admin/camps.`
      );
      return NextResponse.json(
        {
          ok: true,
          accepted: false,
          reason: "No camp matches this formID. Set it in /admin/camps."
        },
        { status: 200 }
      );
    }

    if (camp.kind === "registration") {
      const startYear = new Date(camp.start_date).getUTCFullYear();
      const result = await createRegistrationWithInvoice({
        campId: camp.id,
        campStartYear: startYear,
        feePerCamper: Number(camp.fee_per_camper),
        source: "jotform",
        jotformSubmissionId: parsed.submissionId || null,
        parentName: parsed.parentName,
        parentEmail: parsed.parentEmail,
        parentPhone: parsed.parentPhone,
        campers: parsed.campers,
        rawPayload: parsed.rawPayload
      });

      // Fire the registration_received email (best-effort, don't block webhook
      // response on Resend latency or failure).
      if (result.isNew) {
        const ctx = await loadRegistrationContextByInvoice(result.invoice.id);
        if (ctx) {
          const origin = req.nextUrl.origin;
          void notify.registrationReceived({ ...ctx, origin }).catch((err) => {
            console.warn("[jotform-webhook] notify.registrationReceived failed:", err);
          });
        }
      }

      return NextResponse.json(
        {
          ok: true,
          kind: "registration",
          isNew: result.isNew,
          registrationId: result.registration.id,
          invoiceId: result.invoice.id,
          referenceCode: result.invoice.referenceCode
        },
        { status: 200 }
      );
    }

    // kind === "waitlist"
    const result = await createWaitlistEntry(camp.id, parsed);
    return NextResponse.json(
      {
        ok: true,
        kind: "waitlist",
        isNew: result.isNew,
        waitlistEntryId: result.id
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[jotform-webhook] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** Health check so the owner can sanity-test the URL in a browser. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "JotForm webhook endpoint is live. POST submissions here.",
    docs: "/admin/setup"
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function verifySecret(req: NextRequest): boolean {
  const expected = process.env.JOTFORM_WEBHOOK_SECRET;
  if (!expected) return true; // unset = no verification (fine for dev)
  const fromQuery = req.nextUrl.searchParams.get("secret");
  const fromHeader = req.headers.get("x-jotform-secret");
  return fromQuery === expected || fromHeader === expected;
}

type CampLookup = {
  id: string;
  start_date: string;
  fee_per_camper: number | string;
  kind: "registration" | "waitlist";
};

async function lookupCampByFormId(formId: string): Promise<CampLookup | null> {
  const supabase = createSupabaseAdminClient();

  const { data: regCamp } = await supabase
    .from("camps")
    .select("id, start_date, fee_per_camper")
    .eq("registration_form_jotform_id", formId)
    .maybeSingle();

  if (regCamp) {
    return { ...(regCamp as Omit<CampLookup, "kind">), kind: "registration" };
  }

  const { data: wlCamp } = await supabase
    .from("camps")
    .select("id, start_date, fee_per_camper")
    .eq("waitlist_form_jotform_id", formId)
    .maybeSingle();

  if (wlCamp) {
    return { ...(wlCamp as Omit<CampLookup, "kind">), kind: "waitlist" };
  }

  return null;
}

async function createWaitlistEntry(
  campId: string,
  parsed: ReturnType<typeof parseJotformWebhook>
): Promise<{ id: string; isNew: boolean }> {
  const supabase = createSupabaseAdminClient();

  if (parsed.submissionId) {
    const { data: existing } = await supabase
      .from("waitlist_entries")
      .select("id")
      .eq("jotform_submission_id", parsed.submissionId)
      .maybeSingle();
    if (existing) {
      return { id: (existing as { id: string }).id, isNew: false };
    }
  }

  const { data: maxRow } = await supabase
    .from("waitlist_entries")
    .select("position")
    .eq("camp_id", campId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = ((maxRow as { position: number | null } | null)?.position ?? 0) + 1;
  const camperName = parsed.campers[0]?.name ?? null;

  const { data: inserted, error } = await supabase
    .from("waitlist_entries")
    .insert({
      camp_id: campId,
      jotform_submission_id: parsed.submissionId || null,
      position: nextPosition,
      parent_name: parsed.parentName,
      parent_email: parsed.parentEmail,
      parent_phone: parsed.parentPhone,
      camper_name: camperName,
      raw_payload: parsed.rawPayload
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not create waitlist entry: ${error.message}`);
  return { id: (inserted as { id: string }).id, isNew: true };
}
