import "server-only";

import { fetchEmailTemplate, type EmailTemplateSlug } from "@/lib/admin/email-templates";
import { parseCampData } from "@/lib/admin/camp-data";
import { bumpInvoiceReminderMeta, recordReminder } from "@/lib/admin/reminder-log";
import { buildPaymentUrl } from "@/lib/admin/payment-links";
import { isResendConfigured, sendEmail } from "@/lib/email/resend";
import { renderTemplate, type TemplateValues } from "@/lib/email/templates";
import type {
  Camp,
  Invoice,
  PaymentMethod,
  Registration,
  ReminderKind,
  WaitlistEntry
} from "@/lib/types";

/**
 * High-level "send the X notification" entry points. Each one:
 *   1. Looks up the owner-editable template from `email_templates`.
 *   2. Resolves placeholders from the invoice/registration/camp/etc.
 *   3. Calls Resend, never throws — failures are logged.
 *   4. Records every attempt (sent | failed | skipped) in `reminder_log`.
 *
 * The result lets the rest of the codebase fire-and-forget:
 *     void notify.registrationReceived({ ... });
 */

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const DATE_RANGE = new Intl.DateTimeFormat("en-CA", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

function formatMoney(amount: number): string {
  return CAD.format(amount);
}

function formatDateRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const sFmt = DATE_RANGE.format(s);
    const eFmt = DATE_RANGE.format(e);
    return sFmt === eFmt ? sFmt : `${sFmt} – ${eFmt}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function firstCamperName(registration: Registration): string {
  const first = registration.campers[0];
  if (first && typeof first.name === "string" && first.name.trim()) return first.name.trim();
  if (registration.campers.length > 1) return `${registration.campers.length} campers`;
  return "your camper";
}

function paymentMethodLabel(method: PaymentMethod | string): string {
  switch (method) {
    case "paypal": return "PayPal";
    case "etransfer": return "Interac e-Transfer";
    case "cash": return "Cash at drop-off";
    case "stripe": return "Stripe";
    case "manual": return "Recorded manually";
    default: return String(method);
  }
}

// ---------------------------------------------------------------------------
// Shared send pipeline
// ---------------------------------------------------------------------------

interface SendOptions {
  slug: EmailTemplateSlug;
  reminderNumber: ReminderKind;
  trigger: "auto" | "manual";
  recipient: string | null;
  values: TemplateValues;
  invoiceId?: string | null;
  registrationId?: string | null;
  waitlistEntryId?: string | null;
  bumpInvoiceCounter?: boolean;
}

interface SendResult {
  ok: boolean;
  status: "sent" | "skipped" | "failed";
  reason?: string;
  providerMessageId?: string | null;
}

async function dispatch(opts: SendOptions): Promise<SendResult> {
  if (!opts.recipient || !opts.recipient.includes("@")) {
    await recordReminder({
      invoiceId: opts.invoiceId,
      registrationId: opts.registrationId,
      waitlistEntryId: opts.waitlistEntryId,
      reminderNumber: opts.reminderNumber,
      templateId: opts.slug,
      trigger: opts.trigger,
      sentTo: opts.recipient,
      status: "failed",
      errorMessage: "No recipient email on record."
    });
    return { ok: false, status: "failed", reason: "no-recipient" };
  }

  if (!isResendConfigured()) {
    await recordReminder({
      invoiceId: opts.invoiceId,
      registrationId: opts.registrationId,
      waitlistEntryId: opts.waitlistEntryId,
      reminderNumber: opts.reminderNumber,
      templateId: opts.slug,
      trigger: opts.trigger,
      sentTo: opts.recipient,
      status: "failed",
      errorMessage: "Resend not configured (RESEND_API_KEY + EMAIL_FROM_ADDRESS)."
    });
    return { ok: false, status: "failed", reason: "resend-not-configured" };
  }

  const template = await fetchEmailTemplate(opts.slug);
  if (!template) {
    await recordReminder({
      invoiceId: opts.invoiceId,
      registrationId: opts.registrationId,
      waitlistEntryId: opts.waitlistEntryId,
      reminderNumber: opts.reminderNumber,
      templateId: opts.slug,
      trigger: opts.trigger,
      sentTo: opts.recipient,
      status: "failed",
      errorMessage: `Template '${opts.slug}' not found in email_templates.`
    });
    return { ok: false, status: "failed", reason: "template-missing" };
  }

  if (!template.enabled) {
    await recordReminder({
      invoiceId: opts.invoiceId,
      registrationId: opts.registrationId,
      waitlistEntryId: opts.waitlistEntryId,
      reminderNumber: opts.reminderNumber,
      templateId: opts.slug,
      trigger: opts.trigger,
      sentTo: opts.recipient,
      subject: template.subject,
      status: "failed",
      errorMessage: "Template is disabled by admin."
    });
    return { ok: false, status: "skipped", reason: "template-disabled" };
  }

  const rendered = renderTemplate({
    subjectTemplate: template.subject,
    bodyTemplate: template.bodyMarkdown,
    values: opts.values
  });

  const result = await sendEmail({
    to: opts.recipient,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [
      { name: "template", value: opts.slug },
      { name: "reminder", value: opts.reminderNumber }
    ]
  });

  if (result.error) {
    await recordReminder({
      invoiceId: opts.invoiceId,
      registrationId: opts.registrationId,
      waitlistEntryId: opts.waitlistEntryId,
      reminderNumber: opts.reminderNumber,
      templateId: opts.slug,
      trigger: opts.trigger,
      sentTo: opts.recipient,
      subject: rendered.subject,
      status: "failed",
      errorMessage: result.error
    });
    return { ok: false, status: "failed", reason: result.error };
  }

  await recordReminder({
    invoiceId: opts.invoiceId,
    registrationId: opts.registrationId,
    waitlistEntryId: opts.waitlistEntryId,
    reminderNumber: opts.reminderNumber,
    templateId: opts.slug,
    trigger: opts.trigger,
    sentTo: opts.recipient,
    subject: rendered.subject,
    emailProviderId: result.id,
    status: "sent"
  });

  if (opts.bumpInvoiceCounter && opts.invoiceId) {
    await bumpInvoiceReminderMeta(opts.invoiceId);
  }

  return { ok: true, status: "sent", providerMessageId: result.id };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RegistrationContext {
  camp: Camp;
  registration: Registration;
  invoice: Invoice;
  origin?: string | null;
}

export const notify = {
  /** Sent right after a JotForm submission lands. Includes the payment link. */
  async registrationReceived(ctx: RegistrationContext): Promise<SendResult> {
    const paymentUrl = buildPaymentUrl(ctx.invoice.referenceCode, ctx.origin);
    return dispatch({
      slug: "registration_received",
      reminderNumber: "registration_received",
      trigger: "auto",
      recipient: ctx.registration.parentEmail,
      invoiceId: ctx.invoice.id,
      registrationId: ctx.registration.id,
      values: {
        parent_name: ctx.registration.parentName ?? "there",
        camper_name: firstCamperName(ctx.registration),
        camp_title: ctx.camp.title,
        camp_dates: formatDateRange(ctx.camp.startDate, ctx.camp.endDate),
        ref: ctx.invoice.referenceCode,
        amount: formatMoney(ctx.invoice.amountDue),
        payment_url: paymentUrl
      }
    });
  },

  /** Cron- or button-driven reminder for unpaid invoices. */
  async invoiceReminder(
    ctx: RegistrationContext,
    options: { kind: "t7" | "t3" | "t1" | "manual"; daysUntilCamp?: number }
  ): Promise<SendResult> {
    const paymentUrl = buildPaymentUrl(ctx.invoice.referenceCode, ctx.origin);
    const remainder = Math.max(0, ctx.invoice.amountDue - ctx.invoice.amountPaid);
    const reminderNumber: ReminderKind =
      options.kind === "manual" ? "invoice_reminder_manual" : (`invoice_reminder_${options.kind}` as ReminderKind);

    return dispatch({
      slug: "invoice_reminder",
      reminderNumber,
      trigger: options.kind === "manual" ? "manual" : "auto",
      recipient: ctx.registration.parentEmail,
      invoiceId: ctx.invoice.id,
      registrationId: ctx.registration.id,
      bumpInvoiceCounter: true,
      values: {
        parent_name: ctx.registration.parentName ?? "there",
        camper_name: firstCamperName(ctx.registration),
        camp_title: ctx.camp.title,
        camp_dates: formatDateRange(ctx.camp.startDate, ctx.camp.endDate),
        ref: ctx.invoice.referenceCode,
        amount: formatMoney(remainder),
        payment_url: paymentUrl,
        days_until_camp: options.daysUntilCamp ?? ""
      }
    });
  },

  /** Sent when admin promotes a waitlist entry. Includes the claim link. */
  async waitlistPromoted(args: {
    camp: Camp;
    entry: WaitlistEntry;
    claimUrl: string;
    claimWindow: string; // e.g. "48 hours"
  }): Promise<SendResult> {
    return dispatch({
      slug: "waitlist_promoted",
      reminderNumber: "waitlist_promoted",
      trigger: "auto",
      recipient: args.entry.parentEmail,
      waitlistEntryId: args.entry.id,
      values: {
        parent_name: args.entry.parentName ?? "there",
        camper_name: args.entry.camperName ?? "your camper",
        camp_title: args.camp.title,
        camp_dates: formatDateRange(args.camp.startDate, args.camp.endDate),
        claim_url: args.claimUrl,
        claim_window: args.claimWindow
      }
    });
  },

  /** Sent when an invoice flips to paid. */
  async paymentConfirmation(
    ctx: RegistrationContext,
    args: { amountPaid: number; method: PaymentMethod | string }
  ): Promise<SendResult> {
    return dispatch({
      slug: "payment_confirmation",
      reminderNumber: "payment_confirmation",
      trigger: "auto",
      recipient: ctx.registration.parentEmail,
      invoiceId: ctx.invoice.id,
      registrationId: ctx.registration.id,
      values: {
        parent_name: ctx.registration.parentName ?? "there",
        camper_name: firstCamperName(ctx.registration),
        camp_title: ctx.camp.title,
        camp_dates: formatDateRange(ctx.camp.startDate, ctx.camp.endDate),
        ref: ctx.invoice.referenceCode,
        amount_paid: formatMoney(args.amountPaid),
        payment_method: paymentMethodLabel(args.method)
      }
    });
  }
};

// ---------------------------------------------------------------------------
// Helper used by reminder cron + manual button: load full context by invoice id
// ---------------------------------------------------------------------------

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function loadRegistrationContextByInvoice(
  invoiceId: string
): Promise<RegistrationContext | null> {
  const supabase = createSupabaseAdminClient();
  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .select("*, registrations ( *, camps ( * ) )")
    .eq("id", invoiceId)
    .maybeSingle();
  if (invErr || !invRow) return null;
  const inv = invRow as Record<string, unknown>;
  const reg = (inv.registrations ?? null) as Record<string, unknown> | null;
  const camp = reg ? ((reg.camps ?? null) as Record<string, unknown> | null) : null;
  if (!reg || !camp) return null;

  const campData = parseCampData((camp.data as Record<string, unknown> | null) ?? null);

  return {
    camp: {
      id: camp.id as string,
      slug: camp.slug as string,
      title: camp.title as string,
      status: camp.status as Camp["status"],
      capacity: (camp.capacity as number | null) ?? null,
      startDate: camp.start_date as string,
      endDate: camp.end_date as string,
      location: (camp.location as string | null) ?? null,
      feePerCamper: Number(camp.fee_per_camper),
      registrationFormJotformId: (camp.registration_form_jotform_id as string | null) ?? null,
      waitlistFormJotformId: (camp.waitlist_form_jotform_id as string | null) ?? null,
      registrationClosesAt: (camp.registration_closes_at as string | null) ?? null,
      autoCloseAtCapacity: Boolean(camp.auto_close_at_capacity),
      paymentEmail: campData.paymentEmail,
      heroImage: campData.heroImage,
      featuredOnEvents: campData.featuredOnEvents,
      notes: (camp.notes as string | null) ?? null,
      createdAt: camp.created_at as string,
      updatedAt: camp.updated_at as string
    },
    registration: {
      id: reg.id as string,
      campId: reg.camp_id as string,
      jotformSubmissionId: (reg.jotform_submission_id as string | null) ?? null,
      source: reg.source as Registration["source"],
      parentName: (reg.parent_name as string | null) ?? null,
      parentEmail: (reg.parent_email as string | null) ?? null,
      parentPhone: (reg.parent_phone as string | null) ?? null,
      campers: Array.isArray(reg.campers) ? (reg.campers as Registration["campers"]) : [],
      rawPayload: (reg.raw_payload as Record<string, unknown> | null) ?? {},
      status: reg.status as Registration["status"],
      promotedFromWaitlistId: (reg.promoted_from_waitlist_id as string | null) ?? null,
      cancelledAt: (reg.cancelled_at as string | null) ?? null,
      cancelledReason: (reg.cancelled_reason as string | null) ?? null,
      notes: (reg.notes as string | null) ?? null,
      submittedAt: reg.submitted_at as string,
      createdAt: reg.created_at as string,
      updatedAt: reg.updated_at as string
    },
    invoice: {
      id: inv.id as string,
      registrationId: inv.registration_id as string,
      referenceCode: inv.reference_code as string,
      amountDue: Number(inv.amount_due),
      amountPaid: Number(inv.amount_paid),
      status: inv.status as Invoice["status"],
      dueDate: (inv.due_date as string | null) ?? null,
      sentAt: (inv.sent_at as string | null) ?? null,
      paidAt: (inv.paid_at as string | null) ?? null,
      lastRemindedAt: (inv.last_reminded_at as string | null) ?? null,
      reminderCount: (inv.reminder_count as number) ?? 0,
      autoRemindersPaused: Boolean(inv.auto_reminders_paused),
      pausedUntil: (inv.paused_until as string | null) ?? null,
      notes: (inv.notes as string | null) ?? null,
      createdAt: inv.created_at as string,
      updatedAt: inv.updated_at as string
    }
  };
}
