import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export type RemindersSweepSummary = {
  scanned: number;
  sent: number;
  skipped: number;
  failed: number;
  samples: Array<Record<string, unknown>>;
};

export async function runRemindersSweep(): Promise<RemindersSweepSummary> {
  const summary: RemindersSweepSummary = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    samples: []
  };

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, status, auto_reminders_paused, reminder_count, last_reminded_at, registrations!inner ( id, status, camps!inner ( start_date ) )"
    )
    .in("status", ["pending", "partial"]);

  if (error) {
    throw new Error(`Could not load invoices: ${error.message}`);
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

  return summary;
}
