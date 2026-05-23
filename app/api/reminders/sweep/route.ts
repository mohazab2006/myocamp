import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST/GET /api/reminders/sweep
 *
 * Cron-triggered sweep that:
 *   1. Loads every unpaid invoice attached to an active registration whose
 *      camp starts within the next 8 days.
 *   2. Categorises each one as T-7 / T-3 / T-1 based on days until camp start.
 *   3. Skips invoices that already got that exact reminder, or that have
 *      `auto_reminders_paused = true`.
 *   4. Calls notify.invoiceReminder which itself writes to reminder_log.
 *
 * Authorization: same model as the Gmail poll route — Vercel cron sends
 * `Authorization: Bearer <CRON_SECRET>`; we also accept `?secret=` for manual
 * runs from the admin.
 */
export async function POST(req: NextRequest) {
  return handle(req);
}
export async function GET(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const summary = { scanned: 0, sent: 0, skipped: 0, failed: 0, samples: [] as Array<Record<string, unknown>> };

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  // Pull unpaid/partial invoices whose camp starts within the next 8 days.
  // We join camp via registrations so we can compute "days until camp".
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, status, auto_reminders_paused, reminder_count, last_reminded_at, registrations!inner ( id, status, camps!inner ( start_date ) )"
    )
    .in("status", ["pending", "partial"]);

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Could not load invoices: ${error.message}` },
      { status: 500 }
    );
  }

  type Row = {
    id: string;
    status: string;
    auto_reminders_paused: boolean;
    reminder_count: number;
    last_reminded_at: string | null;
    registrations:
      | { id: string; status: string; camps: { start_date: string } | { start_date: string }[] | null }
      | { id: string; status: string; camps: { start_date: string } | { start_date: string }[] | null }[]
      | null;
  };

  const rows = (data ?? []) as Row[];
  for (const row of rows) {
    summary.scanned++;

    if (row.auto_reminders_paused) {
      summary.skipped++;
      continue;
    }

    const reg = Array.isArray(row.registrations) ? row.registrations[0] : row.registrations;
    if (!reg || reg.status !== "active") {
      summary.skipped++;
      continue;
    }
    const campObj = Array.isArray(reg.camps) ? reg.camps[0] : reg.camps;
    if (!campObj) {
      summary.skipped++;
      continue;
    }

    const startDate = new Date(campObj.start_date + "T00:00:00Z");
    if (startDate > horizon || startDate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
      // Either too far out, or camp already started/ended → skip.
      summary.skipped++;
      continue;
    }
    const daysUntilCamp = Math.ceil((startDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    let kind: "t7" | "t3" | "t1" | null = null;
    let cadenceLabel = "";
    if (daysUntilCamp <= 1) {
      kind = "t1";
      cadenceLabel = "invoice_reminder_t1";
    } else if (daysUntilCamp <= 3) {
      kind = "t3";
      cadenceLabel = "invoice_reminder_t3";
    } else if (daysUntilCamp <= 7) {
      kind = "t7";
      cadenceLabel = "invoice_reminder_t7";
    }
    if (!kind) {
      summary.skipped++;
      continue;
    }

    // Dedupe: don't resend the same cadence reminder twice.
    const { data: prev } = await supabase
      .from("reminder_log")
      .select("id")
      .eq("invoice_id", row.id)
      .eq("reminder_number", cadenceLabel)
      .limit(1)
      .maybeSingle();
    if (prev) {
      summary.skipped++;
      continue;
    }

    const ctx = await loadRegistrationContextByInvoice(row.id);
    if (!ctx) {
      summary.skipped++;
      continue;
    }
    if (!ctx.registration.parentEmail) {
      summary.skipped++;
      continue;
    }

    const result = await notify.invoiceReminder(ctx, { kind, daysUntilCamp });
    if (result.ok) summary.sent++;
    else if (result.status === "skipped") summary.skipped++;
    else summary.failed++;

    summary.samples.push({
      invoiceId: row.id,
      ref: ctx.invoice.referenceCode,
      cadence: cadenceLabel,
      daysUntilCamp,
      to: ctx.registration.parentEmail,
      result: result.status,
      reason: result.reason ?? null
    });
  }

  return NextResponse.json({ ok: true, ...summary });
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // dev convenience — unset = open
  const auth = req.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;
  const fromQuery = req.nextUrl.searchParams.get("secret");
  return fromQuery === expected;
}
