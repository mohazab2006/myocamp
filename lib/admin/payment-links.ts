import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseCampData } from "@/lib/admin/camp-data";
import type { Camp, CamperInfo, Invoice, Registration } from "@/lib/types";

export interface InvoiceLookupResult {
  camp: Camp;
  registration: Registration;
  invoice: Invoice;
  paymentEmail: string | null;
}

type CampRow = {
  id: string;
  slug: string;
  title: string;
  status: Camp["status"];
  capacity: number | null;
  start_date: string;
  end_date: string;
  location: string | null;
  fee_per_camper: number | string;
  registration_form_jotform_id: string | null;
  waitlist_form_jotform_id: string | null;
  registration_closes_at: string | null;
  auto_close_at_capacity: boolean;
  notes: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type RegistrationRow = {
  id: string;
  camp_id: string;
  jotform_submission_id: string | null;
  source: Registration["source"];
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  campers: CamperInfo[] | null;
  raw_payload: Record<string, unknown> | null;
  status: Registration["status"];
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

function rowToCamp(row: CampRow): Camp {
  const data = parseCampData(row.data);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    capacity: row.capacity,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    feePerCamper: Number(row.fee_per_camper),
    registrationFormJotformId: row.registration_form_jotform_id,
    waitlistFormJotformId: row.waitlist_form_jotform_id,
    registrationClosesAt: row.registration_closes_at,
    autoCloseAtCapacity: row.auto_close_at_capacity,
    paymentEmail: data.paymentEmail,
    heroImage: data.heroImage,
    featuredOnEvents: data.featuredOnEvents,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

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

/**
 * Resolve the e-transfer destination email for a given camp.
 * Priority:  camp.data.paymentEmail  →  PAYMENT_EMAIL env  →  null
 */
export function resolvePaymentEmail(camp: Camp, campData: Record<string, unknown> | null): string | null {
  if (camp.paymentEmail) return camp.paymentEmail;
  const fromCamp = campData && typeof campData.paymentEmail === "string" ? campData.paymentEmail : null;
  if (fromCamp) return fromCamp;
  const fromEnv = process.env.PAYMENT_EMAIL ?? process.env.NEXT_PUBLIC_PAYMENT_EMAIL;
  if (fromEnv) return fromEnv;
  return null;
}

/**
 * Look up a registration + invoice + camp by the human-friendly reference code.
 * Used by /camp/pay/[ref] (public) and the PayPal route handlers.
 */
export async function findByReferenceCode(
  referenceCode: string
): Promise<InvoiceLookupResult | null> {
  const supabase = createSupabaseAdminClient();

  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("reference_code", referenceCode)
    .maybeSingle();

  if (invErr || !invRow) return null;
  const invoice = rowToInvoice(invRow as InvoiceRow);

  const { data: regRow, error: regErr } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", invoice.registrationId)
    .maybeSingle();

  if (regErr || !regRow) return null;
  const registration = rowToRegistration(regRow as RegistrationRow);

  const { data: campRow, error: campErr } = await supabase
    .from("camps")
    .select("*")
    .eq("id", registration.campId)
    .maybeSingle();

  if (campErr || !campRow) return null;
  const camp = rowToCamp(campRow as CampRow);
  const campData = (campRow as CampRow).data ?? null;

  return {
    camp,
    registration,
    invoice,
    paymentEmail: resolvePaymentEmail(camp, campData)
  };
}

/**
 * Build the canonical public payment URL for a reference code.
 * Uses NEXT_PUBLIC_SITE_URL → fallback to the request origin (caller passes it in).
 */
export function buildPaymentUrl(referenceCode: string, origin?: string | null): string {
  const base =
    origin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://myo.camp";
  return `${base.replace(/\/$/, "")}/camp/pay/${encodeURIComponent(referenceCode)}`;
}
