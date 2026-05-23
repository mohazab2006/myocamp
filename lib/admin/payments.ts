import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Invoice, Payment, PaymentMethod, PaymentStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Row → domain mappers
// ---------------------------------------------------------------------------

type PaymentRow = {
  id: string;
  invoice_id: string | null;
  method: PaymentMethod;
  amount: number | string;
  status: PaymentStatus;
  external_ref: string | null;
  sender_name: string | null;
  sender_email: string | null;
  sender_memo: string | null;
  cash_received: boolean | null;
  received_at: string;
  matched_by: string | null;
  notes: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type InvoiceRow = {
  id: string;
  registration_id: string;
  reference_code: string;
  amount_due: number | string;
  amount_paid: number | string;
  status: Invoice["status"];
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  last_reminded_at: string | null;
  reminder_count: number;
  auto_reminders_paused: boolean;
  paused_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function rowToPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    method: row.method,
    amount: Number(row.amount),
    status: row.status,
    externalRef: row.external_ref,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    senderMemo: row.sender_memo,
    cashReceived: row.cash_received,
    receivedAt: row.received_at,
    matchedBy: row.matched_by,
    notes: row.notes,
    rawPayload: row.raw_payload ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function fetchPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("received_at", { ascending: false });

  if (error) {
    console.warn("fetchPaymentsForInvoice failed:", error.message);
    return [];
  }
  return (data as PaymentRow[]).map(rowToPayment);
}

// ---------------------------------------------------------------------------
// Recompute invoice totals from its payment rows.
// Single source of truth → call after any payment insert/update/delete.
// ---------------------------------------------------------------------------

export async function recomputeInvoiceTotals(invoiceId: string): Promise<Invoice | null> {
  const supabase = createSupabaseAdminClient();

  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invErr || !invRow) return null;
  const invoice = invRow as InvoiceRow;

  const { data: payRows, error: payErr } = await supabase
    .from("payments")
    .select("amount, status, received_at")
    .eq("invoice_id", invoiceId);

  if (payErr) {
    console.warn("recomputeInvoiceTotals(payments) failed:", payErr.message);
    return null;
  }

  let paid = 0;
  let latestReceivedAt: string | null = null;
  for (const row of payRows as Array<{ amount: number | string; status: string; received_at: string }>) {
    if (row.status === "received") {
      paid += Number(row.amount);
      if (!latestReceivedAt || row.received_at > latestReceivedAt) {
        latestReceivedAt = row.received_at;
      }
    } else if (row.status === "refunded") {
      paid -= Number(row.amount);
    }
  }
  paid = Number(paid.toFixed(2));
  const due = Number(invoice.amount_due);

  let status: Invoice["status"];
  if (paid <= 0) status = "pending";
  else if (paid >= due) status = "paid";
  else status = "partial";

  // If invoice is fully refunded by negative balance leave as cancelled? Treat as refunded.
  if (paid < 0) status = "refunded";

  const { data: updated, error: updErr } = await supabase
    .from("invoices")
    .update({
      amount_paid: paid,
      status,
      paid_at: status === "paid" ? (latestReceivedAt ?? new Date().toISOString()) : null
    })
    .eq("id", invoiceId)
    .select("*")
    .single();

  if (updErr) {
    console.warn("recomputeInvoiceTotals(update) failed:", updErr.message);
    return null;
  }

  const row = updated as InvoiceRow;
  return {
    id: row.id,
    registrationId: row.registration_id,
    referenceCode: row.reference_code,
    amountDue: Number(row.amount_due),
    amountPaid: Number(row.amount_paid),
    status: row.status,
    dueDate: row.due_date,
    sentAt: row.sent_at,
    paidAt: row.paid_at,
    lastRemindedAt: row.last_reminded_at,
    reminderCount: row.reminder_count,
    autoRemindersPaused: row.auto_reminders_paused,
    pausedUntil: row.paused_until,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export interface RecordPaymentInput {
  invoiceId: string | null;
  method: PaymentMethod;
  amount: number;
  status?: PaymentStatus;
  externalRef?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  senderMemo?: string | null;
  cashReceived?: boolean | null;
  receivedAt?: string | null;
  matchedBy?: string | null;
  notes?: string | null;
  rawPayload?: Record<string, unknown>;
}

export async function recordPayment(input: RecordPaymentInput): Promise<Payment> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: input.invoiceId,
      method: input.method,
      amount: Number(input.amount.toFixed(2)),
      status: input.status ?? "received",
      external_ref: input.externalRef ?? null,
      sender_name: input.senderName ?? null,
      sender_email: input.senderEmail ?? null,
      sender_memo: input.senderMemo ?? null,
      cash_received: input.cashReceived ?? null,
      received_at: input.receivedAt ?? new Date().toISOString(),
      matched_by: input.matchedBy ?? null,
      notes: input.notes ?? null,
      raw_payload: input.rawPayload ?? {}
    })
    .select("*")
    .single();

  if (error) throw new Error(`Could not record payment: ${error.message}`);

  if (input.invoiceId) {
    await recomputeInvoiceTotals(input.invoiceId);
  }

  return rowToPayment(data as PaymentRow);
}

export async function updateCashReceived(paymentId: string, received: boolean): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("payments")
    .update({ cash_received: received })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);
}

export async function voidPayment(paymentId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "refunded" })
    .eq("id", paymentId)
    .select("invoice_id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const invoiceId = (data as { invoice_id: string | null } | null)?.invoice_id;
  if (invoiceId) await recomputeInvoiceTotals(invoiceId);
}
