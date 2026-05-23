import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReminderLogRow, ReminderStatus, ReminderTrigger } from "@/lib/types";

type Row = {
  id: string;
  invoice_id: string | null;
  registration_id: string | null;
  waitlist_entry_id: string | null;
  reminder_number: string;
  template_id: string | null;
  trigger: ReminderTrigger;
  sent_by: string | null;
  sent_to: string | null;
  subject: string | null;
  email_provider_id: string | null;
  error_message: string | null;
  status: ReminderStatus;
  sent_at: string;
};

function rowToLog(row: Row): ReminderLogRow {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    registrationId: row.registration_id,
    waitlistEntryId: row.waitlist_entry_id,
    reminderNumber: row.reminder_number,
    templateId: row.template_id,
    trigger: row.trigger,
    sentBy: row.sent_by,
    sentTo: row.sent_to,
    subject: row.subject,
    emailProviderId: row.email_provider_id,
    errorMessage: row.error_message,
    status: row.status,
    sentAt: row.sent_at
  };
}

export interface RecordReminderInput {
  invoiceId?: string | null;
  registrationId?: string | null;
  waitlistEntryId?: string | null;
  reminderNumber: string;
  templateId?: string | null;
  trigger: ReminderTrigger;
  sentBy?: string | null;
  sentTo: string | null;
  subject?: string | null;
  emailProviderId?: string | null;
  errorMessage?: string | null;
  status: ReminderStatus;
}

export async function recordReminder(input: RecordReminderInput): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("reminder_log").insert({
    invoice_id: input.invoiceId ?? null,
    registration_id: input.registrationId ?? null,
    waitlist_entry_id: input.waitlistEntryId ?? null,
    reminder_number: input.reminderNumber,
    template_id: input.templateId ?? null,
    trigger: input.trigger,
    sent_by: input.sentBy ?? null,
    sent_to: input.sentTo,
    subject: input.subject ?? null,
    email_provider_id: input.emailProviderId ?? null,
    error_message: input.errorMessage ?? null,
    status: input.status
  });
  if (error) {
    console.warn("recordReminder failed:", error.message);
  }
}

export async function fetchRemindersForInvoice(
  invoiceId: string
): Promise<ReminderLogRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reminder_log")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("sent_at", { ascending: false });
  if (error) return [];
  return (data as Row[]).map(rowToLog);
}

export async function fetchRemindersForRegistration(
  registrationId: string
): Promise<ReminderLogRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reminder_log")
    .select("*")
    .or(`registration_id.eq.${registrationId}`)
    .order("sent_at", { ascending: false });
  if (error) return [];
  return (data as Row[]).map(rowToLog);
}

export async function fetchLatestReminderForInvoice(
  invoiceId: string,
  reminderNumber: string
): Promise<ReminderLogRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reminder_log")
    .select("*")
    .eq("invoice_id", invoiceId)
    .eq("reminder_number", reminderNumber)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToLog(data as Row);
}

// ---------------------------------------------------------------------------
// Bump the invoice reminder counter + last_reminded_at after a successful send.
// Centralised here so callers don't all reach into the invoices table directly.
// ---------------------------------------------------------------------------

export async function bumpInvoiceReminderMeta(invoiceId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase
    .from("invoices")
    .select("reminder_count")
    .eq("id", invoiceId)
    .maybeSingle();
  const current = (row as { reminder_count: number } | null)?.reminder_count ?? 0;
  await supabase
    .from("invoices")
    .update({
      last_reminded_at: new Date().toISOString(),
      reminder_count: current + 1
    })
    .eq("id", invoiceId);
}

export async function setInvoiceRemindersPaused(
  invoiceId: string,
  paused: boolean
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("invoices")
    .update({ auto_reminders_paused: paused })
    .eq("id", invoiceId);
  if (error) throw new Error(error.message);
}
