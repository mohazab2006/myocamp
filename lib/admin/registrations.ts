import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateUniqueReferenceCode } from "@/lib/admin/reference-code";
import { syncCampCapacityStatus } from "@/lib/admin/camp-capacity";
import type {
  CamperInfo,
  Invoice,
  Registration,
  RegistrationSource,
  RegistrationStatus
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Row → domain mappers
// ---------------------------------------------------------------------------

type RegistrationRow = {
  id: string;
  camp_id: string;
  jotform_submission_id: string | null;
  source: RegistrationSource;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  campers: CamperInfo[] | null;
  raw_payload: Record<string, unknown> | null;
  status: RegistrationStatus;
  promoted_from_waitlist_id: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  notes: string | null;
  submitted_at: string;
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

function rowToRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    campId: row.camp_id,
    jotformSubmissionId: row.jotform_submission_id,
    source: row.source,
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    campers: Array.isArray(row.campers) ? row.campers : [],
    rawPayload: row.raw_payload ?? {},
    status: row.status,
    promotedFromWaitlistId: row.promoted_from_waitlist_id,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
    notes: row.notes,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToInvoice(row: InvoiceRow): Invoice {
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
// Read
// ---------------------------------------------------------------------------

export interface RegistrationWithInvoice {
  registration: Registration;
  invoice: Invoice | null;
}

export async function fetchRegistrationsForCamp(
  campId: string
): Promise<RegistrationWithInvoice[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*, invoices ( * )")
    .eq("camp_id", campId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.warn("fetchRegistrationsForCamp failed:", error.message);
    return [];
  }

  return (data as Array<RegistrationRow & { invoices: InvoiceRow[] }>).map((row) => ({
    registration: rowToRegistration(row),
    invoice: row.invoices?.[0] ? rowToInvoice(row.invoices[0]) : null
  }));
}

export async function fetchRegistrationById(
  id: string
): Promise<RegistrationWithInvoice | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*, invoices ( * )")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as RegistrationRow & { invoices: InvoiceRow[] };
  return {
    registration: rowToRegistration(row),
    invoice: row.invoices?.[0] ? rowToInvoice(row.invoices[0]) : null
  };
}

export async function findRegistrationByJotformSubmission(
  jotformSubmissionId: string
): Promise<Registration | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("jotform_submission_id", jotformSubmissionId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRegistration(data as RegistrationRow);
}

/** Active registration for the same camp + parent email (blocks duplicate JotForm submits). */
export async function findActiveRegistrationByCampAndEmail(
  campId: string,
  parentEmail: string | null
): Promise<Registration | null> {
  const email = parentEmail?.trim();
  if (!email) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("camp_id", campId)
    .eq("status", "active")
    .ilike("parent_email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRegistration(data as RegistrationRow);
}

async function loadInvoiceForRegistration(registrationId: string): Promise<Invoice | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("registration_id", registrationId)
    .maybeSingle();
  if (!data) return null;
  return rowToInvoice(data as InvoiceRow);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateRegistrationInput {
  campId: string;
  campStartYear: number;
  feePerCamper: number;
  source: RegistrationSource;
  jotformSubmissionId?: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  campers: CamperInfo[];
  rawPayload: Record<string, unknown>;
  notes?: string | null;
}

export interface CreatedRegistration {
  registration: Registration;
  invoice: Invoice;
  isNew: boolean;
}

/**
 * Create a registration + invoice in one shot. If a registration with the
 * same `jotformSubmissionId` already exists, the existing rows are returned
 * (idempotent — webhooks retry).
 */
export async function createRegistrationWithInvoice(
  input: CreateRegistrationInput
): Promise<CreatedRegistration> {
  const supabase = createSupabaseAdminClient();

  if (input.jotformSubmissionId) {
    const existing = await findRegistrationByJotformSubmission(input.jotformSubmissionId);
    if (existing) {
      const invoice = await loadInvoiceForRegistration(existing.id);
      if (invoice) {
        return {
          registration: existing,
          invoice,
          isNew: false
        };
      }
    }
  }

  const existingByEmail = await findActiveRegistrationByCampAndEmail(
    input.campId,
    input.parentEmail
  );
  if (existingByEmail) {
    const invoice = await loadInvoiceForRegistration(existingByEmail.id);
    if (invoice) {
      if (
        input.jotformSubmissionId &&
        input.jotformSubmissionId !== existingByEmail.jotformSubmissionId
      ) {
        await supabase
          .from("registrations")
          .update({ jotform_submission_id: input.jotformSubmissionId })
          .eq("id", existingByEmail.id);
      }
      return {
        registration:
          input.jotformSubmissionId &&
          input.jotformSubmissionId !== existingByEmail.jotformSubmissionId
            ? { ...existingByEmail, jotformSubmissionId: input.jotformSubmissionId }
            : existingByEmail,
        invoice,
        isNew: false
      };
    }
  }

  const { data: regRow, error: regErr } = await supabase
    .from("registrations")
    .insert({
      camp_id: input.campId,
      jotform_submission_id: input.jotformSubmissionId ?? null,
      source: input.source,
      parent_name: input.parentName,
      parent_email: input.parentEmail,
      parent_phone: input.parentPhone,
      campers: input.campers,
      raw_payload: input.rawPayload,
      notes: input.notes ?? null
    })
    .select("*")
    .single();

  if (regErr) throw new Error(`Could not create registration: ${regErr.message}`);
  const registration = rowToRegistration(regRow as RegistrationRow);

  const camperCount = Math.max(1, input.campers.length);
  const amountDue = Number((input.feePerCamper * camperCount).toFixed(2));
  const referenceCode = await generateUniqueReferenceCode(input.campStartYear);

  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .insert({
      registration_id: registration.id,
      reference_code: referenceCode,
      amount_due: amountDue
    })
    .select("*")
    .single();

  if (invErr) {
    // Rollback registration if invoice creation fails.
    await supabase.from("registrations").delete().eq("id", registration.id);
    throw new Error(`Could not create invoice: ${invErr.message}`);
  }

  void syncCampCapacityStatus(registration.campId).catch((err) => {
    console.warn("syncCampCapacityStatus after create failed:", err);
  });

  return {
    registration,
    invoice: rowToInvoice(invRow as InvoiceRow),
    isNew: true
  };
}

// ---------------------------------------------------------------------------
// Update / cancel
// ---------------------------------------------------------------------------

export async function cancelRegistration(id: string, reason: string | null): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase
    .from("registrations")
    .select("camp_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("registrations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const campId = (row as { camp_id: string } | null)?.camp_id;
  if (campId) {
    void syncCampCapacityStatus(campId).catch((err) => {
      console.warn("syncCampCapacityStatus after cancel failed:", err);
    });
  }
}

export async function reactivateRegistration(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase
    .from("registrations")
    .select("camp_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("registrations")
    .update({
      status: "active",
      cancelled_at: null,
      cancelled_reason: null
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const campId = (row as { camp_id: string } | null)?.camp_id;
  if (campId) {
    void syncCampCapacityStatus(campId).catch((err) => {
      console.warn("syncCampCapacityStatus after reactivate failed:", err);
    });
  }
}

export async function updateRegistrationContact(
  id: string,
  contact: { parentName: string | null; parentEmail: string | null; parentPhone: string | null }
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("registrations")
    .update({
      parent_name: contact.parentName,
      parent_email: contact.parentEmail,
      parent_phone: contact.parentPhone
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateRegistrationNotes(id: string, notes: string | null): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("registrations")
    .update({ notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
