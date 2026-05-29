import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export type PaymentFollowupSweepSummary = {
  scanned: number;
  sent: number;
  skipped: number;
  failed: number;
  samples: Array<Record<string, unknown>>;
};

const FOLLOWUP_KIND = "payment_followup_d2";
const FOLLOWUP_AFTER_MS = 2 * 24 * 60 * 60 * 1000;

type InvoiceRow = {
  id: string;
  reference_code: string;
  amount_due: number | string;
  amount_paid: number | string;
  status: string;
  auto_reminders_paused: boolean;
  created_at: string;
  registrations:
    | {
        id: string;
        status: string;
        parent_email: string | null;
        submitted_at: string;
      }
    | Array<{
        id: string;
        status: string;
        parent_email: string | null;
        submitted_at: string;
      }>
    | null;
};

/** Skip follow-up when we already see payment activity or an e-Transfer in triage. */
async function invoiceHasPaymentSignal(args: {
  invoiceId: string;
  referenceCode: string;
  parentEmail: string | null;
  remaining: number;
}): Promise<boolean> {
  const supabase = createSupabaseAdminClient();

  const { count: paymentCount } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", args.invoiceId);
  if (paymentCount && paymentCount > 0) return true;

  if (args.remaining <= 0) return true;

  const { data: refInbound } = await supabase
    .from("inbound_emails")
    .select("id")
    .eq("parsed_reference_code", args.referenceCode)
    .in("match_status", ["unmatched", "pending", "error"])
    .limit(1);
  if (refInbound?.length) return true;

  const { data: noRefInbound } = await supabase
    .from("inbound_emails")
    .select("parsed_amount, match_status, error_message")
    .is("parsed_reference_code", null)
    .eq("match_status", "unmatched")
    .not("parsed_amount", "is", null);

  for (const row of noRefInbound ?? []) {
    const amount = Number(row.parsed_amount);
    if (Math.abs(amount - args.remaining) > 0.01) continue;
    if (!row.error_message?.includes("camp payment")) continue;
    if (!args.parentEmail?.trim()) continue;
    return true;
  }

  return false;
}

export async function runPaymentFollowupSweep(): Promise<PaymentFollowupSweepSummary> {
  const summary: PaymentFollowupSweepSummary = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    samples: []
  };

  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - FOLLOWUP_AFTER_MS);

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, reference_code, amount_due, amount_paid, status, auto_reminders_paused, created_at, registrations!inner ( id, status, parent_email, submitted_at )"
    )
    .eq("status", "pending")
    .lte("amount_paid", 0);

  if (error) {
    throw new Error(`Could not load invoices for payment follow-up: ${error.message}`);
  }

  for (const raw of (data ?? []) as InvoiceRow[]) {
    summary.scanned++;

    if (raw.auto_reminders_paused) {
      summary.skipped++;
      continue;
    }

    const reg = Array.isArray(raw.registrations) ? raw.registrations[0] : raw.registrations;
    if (!reg || reg.status !== "active") {
      summary.skipped++;
      continue;
    }

    if (!reg.parent_email?.trim()) {
      summary.skipped++;
      continue;
    }

    const registeredAt = new Date(reg.submitted_at);
    if (registeredAt > cutoff) {
      summary.skipped++;
      continue;
    }

    const remaining = Number((Number(raw.amount_due) - Number(raw.amount_paid)).toFixed(2));
    if (remaining <= 0) {
      summary.skipped++;
      continue;
    }

    const hasSignal = await invoiceHasPaymentSignal({
      invoiceId: raw.id,
      referenceCode: raw.reference_code,
      parentEmail: reg.parent_email,
      remaining
    });
    if (hasSignal) {
      summary.skipped++;
      continue;
    }

    const { data: prev } = await supabase
      .from("reminder_log")
      .select("id")
      .eq("invoice_id", raw.id)
      .eq("reminder_number", FOLLOWUP_KIND)
      .limit(1)
      .maybeSingle();
    if (prev) {
      summary.skipped++;
      continue;
    }

    const ctx = await loadRegistrationContextByInvoice(raw.id);
    if (!ctx) {
      summary.skipped++;
      continue;
    }

    const result = await notify.paymentFollowup(ctx);
    if (result.ok) summary.sent++;
    else if (result.status === "skipped") summary.skipped++;
    else summary.failed++;

    summary.samples.push({
      invoiceId: raw.id,
      ref: ctx.invoice.referenceCode,
      registeredAt: reg.submitted_at,
      to: ctx.registration.parentEmail,
      result: result.status,
      reason: result.reason ?? null
    });
  }

  return summary;
}
