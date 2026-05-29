import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractAllReferenceCodes } from "@/lib/admin/etransfer-parser";
import { recordSplitFamilyPayment } from "@/lib/admin/family-billing";
import { recordPayment } from "@/lib/admin/payments";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";
import type {
  InboundEmail,
  InboundEmailMatchStatus,
  Invoice
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Row → domain mapper
// ---------------------------------------------------------------------------

type InboundEmailRow = {
  id: string;
  gmail_message_id: string;
  from_address: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  parsed_amount: number | string | null;
  parsed_sender_name: string | null;
  parsed_memo: string | null;
  parsed_reference_code: string | null;
  match_status: InboundEmailMatchStatus;
  matched_payment_id: string | null;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
  raw_payload: Record<string, unknown> | null;
};

function rowToInboundEmail(row: InboundEmailRow): InboundEmail {
  return {
    id: row.id,
    gmailMessageId: row.gmail_message_id,
    fromAddress: row.from_address,
    subject: row.subject,
    bodyText: row.body_text,
    bodyHtml: row.body_html,
    parsedAmount: row.parsed_amount != null ? Number(row.parsed_amount) : null,
    parsedSenderName: row.parsed_sender_name,
    parsedMemo: row.parsed_memo,
    parsedReferenceCode: row.parsed_reference_code,
    matchStatus: row.match_status,
    matchedPaymentId: row.matched_payment_id,
    errorMessage: row.error_message,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
    rawPayload: row.raw_payload ?? {}
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function fetchInboundEmails(options?: {
  statuses?: InboundEmailMatchStatus[];
  limit?: number;
}): Promise<InboundEmail[]> {
  const supabase = createSupabaseAdminClient();
  let q = supabase
    .from("inbound_emails")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(options?.limit ?? 100);
  if (options?.statuses && options.statuses.length > 0) {
    q = q.in("match_status", options.statuses);
  }
  const { data, error } = await q;
  if (error) {
    console.warn("fetchInboundEmails failed:", error.message);
    return [];
  }
  return (data as InboundEmailRow[]).map(rowToInboundEmail);
}

export async function fetchInboundEmailById(id: string): Promise<InboundEmail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToInboundEmail(data as InboundEmailRow);
}

export async function findInboundEmailByGmailId(
  gmailMessageId: string
): Promise<InboundEmail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .select("*")
    .eq("gmail_message_id", gmailMessageId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToInboundEmail(data as InboundEmailRow);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export interface CreateInboundEmailInput {
  gmailMessageId: string;
  fromAddress: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  parsedAmount: number | null;
  parsedSenderName: string | null;
  parsedMemo: string | null;
  parsedReferenceCode: string | null;
  matchStatus: InboundEmailMatchStatus;
  matchedPaymentId: string | null;
  errorMessage: string | null;
  receivedAt: string;
  processedAt: string | null;
  rawPayload?: Record<string, unknown>;
}

export async function createInboundEmail(input: CreateInboundEmailInput): Promise<InboundEmail> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .insert({
      gmail_message_id: input.gmailMessageId,
      from_address: input.fromAddress,
      subject: input.subject,
      body_text: input.bodyText,
      body_html: input.bodyHtml,
      parsed_amount: input.parsedAmount,
      parsed_sender_name: input.parsedSenderName,
      parsed_memo: input.parsedMemo,
      parsed_reference_code: input.parsedReferenceCode,
      match_status: input.matchStatus,
      matched_payment_id: input.matchedPaymentId,
      error_message: input.errorMessage,
      received_at: input.receivedAt,
      processed_at: input.processedAt,
      raw_payload: input.rawPayload ?? {}
    })
    .select("*")
    .single();
  if (error) throw new Error(`Could not insert inbound_email: ${error.message}`);
  return rowToInboundEmail(data as InboundEmailRow);
}

export async function updateInboundEmailMatch(
  id: string,
  patch: {
    matchStatus: InboundEmailMatchStatus;
    matchedPaymentId?: string | null;
    errorMessage?: string | null;
    processedAt?: string | null;
  }
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("inbound_emails")
    .update({
      match_status: patch.matchStatus,
      matched_payment_id: patch.matchedPaymentId ?? null,
      error_message: patch.errorMessage ?? null,
      processed_at: patch.processedAt ?? new Date().toISOString()
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Match helpers
// ---------------------------------------------------------------------------

export interface InvoiceLookupForMatch {
  id: string;
  referenceCode: string;
  amountDue: number;
  amountPaid: number;
  status: Invoice["status"];
}

type InvoiceRow = {
  id: string;
  reference_code: string;
  amount_due: number | string;
  amount_paid: number | string;
  status: Invoice["status"];
};

export async function findInvoiceByReferenceCode(
  referenceCode: string
): Promise<InvoiceLookupForMatch | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, reference_code, amount_due, amount_paid, status")
    .eq("reference_code", referenceCode)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as InvoiceRow;
  return {
    id: row.id,
    referenceCode: row.reference_code,
    amountDue: Number(row.amount_due),
    amountPaid: Number(row.amount_paid),
    status: row.status
  };
}

/**
 * Try to auto-match an inbound e-transfer email to an invoice.
 *
 * Match rules (in order):
 *   1. EXACT — parsedReferenceCode hits an invoice exactly.
 *   2. NOTHING ELSE auto-matches. Anything ambiguous goes to triage.
 *
 * Returns the result + an InboundEmail row that's already been saved.
 */
export interface AutoMatchInput {
  gmailMessageId: string;
  fromAddress: string | null;
  subject: string | null;
  bodyText: string;
  bodyHtml: string;
  receivedAt: string;
  parsed: {
    isInteracNotification: boolean;
    amount: number | null;
    senderName: string | null;
    senderEmail: string | null;
    memo: string | null;
    referenceCode: string | null;
  };
  rawPayload?: Record<string, unknown>;
}

export interface AutoMatchOutcome {
  inboundEmail: InboundEmail;
  matched: boolean;
  paymentId: string | null;
}

export async function ingestEtransferEmail(input: AutoMatchInput): Promise<AutoMatchOutcome> {
  // Skip non-Interac emails — record them but flag as not_payment so the inbox
  // tab doesn't show them.
  if (!input.parsed.isInteracNotification) {
    const inboundEmail = await createInboundEmail({
      gmailMessageId: input.gmailMessageId,
      fromAddress: input.fromAddress,
      subject: input.subject,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml,
      parsedAmount: null,
      parsedSenderName: null,
      parsedMemo: null,
      parsedReferenceCode: null,
      matchStatus: "not_payment",
      matchedPaymentId: null,
      errorMessage: null,
      receivedAt: input.receivedAt,
      processedAt: new Date().toISOString(),
      rawPayload: input.rawPayload
    });
    return { inboundEmail, matched: false, paymentId: null };
  }

  let matchStatus: InboundEmailMatchStatus = "unmatched";
  let matchedPaymentId: string | null = null;
  let errorMessage: string | null = null;

  // Auto-match: one or more reference codes in the memo / body.
  const refHaystack = [input.parsed.memo, input.subject, input.bodyText].filter(Boolean).join("\n");
  const referenceCodes = extractAllReferenceCodes(refHaystack);
  if (referenceCodes.length === 0 && input.parsed.referenceCode) {
    referenceCodes.push(input.parsed.referenceCode);
  }

  if (referenceCodes.length > 0) {
    const invoices = (
      await Promise.all(referenceCodes.map((code) => findInvoiceByReferenceCode(code)))
    ).filter((inv): inv is NonNullable<typeof inv> => inv != null);

    if (invoices.length === 0) {
      errorMessage = `Reference ${referenceCodes.join(", ")} not found in invoices.`;
    } else if (input.parsed.amount == null) {
      errorMessage = "Reference matched but amount could not be parsed.";
    } else if (invoices.length === 1) {
      const invoice = invoices[0]!;
      try {
        const payment = await recordPayment({
          invoiceId: invoice.id,
          method: "etransfer",
          amount: input.parsed.amount,
          status: "received",
          externalRef: input.gmailMessageId,
          senderName: input.parsed.senderName,
          senderEmail: input.parsed.senderEmail,
          senderMemo: input.parsed.memo,
          receivedAt: input.receivedAt,
          notes: "Auto-matched by Gmail e-transfer parser",
          rawPayload: input.rawPayload
        });
        matchStatus = "matched";
        matchedPaymentId = payment.id;

        try {
          const ctx = await loadRegistrationContextByInvoice(invoice.id);
          if (ctx && ctx.invoice.status === "paid") {
            void notify
              .paymentConfirmation(ctx, { amountPaid: input.parsed.amount, method: "etransfer" })
              .catch((nErr) => console.warn("[ingestEtransferEmail] notify failed:", nErr));
          }
        } catch (nErr) {
          console.warn("[ingestEtransferEmail] notify lookup failed:", nErr);
        }
      } catch (err) {
        matchStatus = "error";
        errorMessage = err instanceof Error ? err.message : "Could not record payment.";
      }
    } else {
      const missing = referenceCodes.filter(
        (code) => !invoices.some((inv) => inv.referenceCode === code)
      );
      if (missing.length > 0) {
        errorMessage = `Some references not found: ${missing.join(", ")}.`;
      } else {
        try {
          const { paymentIds } = await recordSplitFamilyPayment(
            invoices.map((inv) => inv.id),
            input.parsed.amount,
            {
              method: "etransfer",
              status: "received",
              externalRef: input.gmailMessageId,
              senderName: input.parsed.senderName,
              senderEmail: input.parsed.senderEmail,
              senderMemo: input.parsed.memo,
              receivedAt: input.receivedAt,
              notes: `Auto-matched family e-transfer (${referenceCodes.join(", ")})`,
              rawPayload: input.rawPayload
            }
          );
          if (paymentIds.length > 0) {
            matchStatus = "matched";
            matchedPaymentId = paymentIds[0] ?? null;
            for (const invoice of invoices) {
              try {
                const ctx = await loadRegistrationContextByInvoice(invoice.id);
                if (ctx && ctx.invoice.status === "paid") {
                  void notify
                    .paymentConfirmation(ctx, {
                      amountPaid: input.parsed.amount,
                      method: "etransfer"
                    })
                    .catch((nErr) => console.warn("[ingestEtransferEmail] notify failed:", nErr));
                }
              } catch {
                // continue
              }
            }
          } else {
            errorMessage = "Family e-transfer could not be applied to any invoice.";
          }
        } catch (err) {
          matchStatus = "error";
          errorMessage = err instanceof Error ? err.message : "Could not record family payment.";
        }
      }
    }
  }

  const storedReferenceCode =
    referenceCodes.length > 0 ? referenceCodes.join(", ") : input.parsed.referenceCode;

  const inboundEmail = await createInboundEmail({
    gmailMessageId: input.gmailMessageId,
    fromAddress: input.fromAddress,
    subject: input.subject,
    bodyText: input.bodyText,
    bodyHtml: input.bodyHtml,
    parsedAmount: input.parsed.amount,
    parsedSenderName: input.parsed.senderName,
    parsedMemo: input.parsed.memo,
    parsedReferenceCode: storedReferenceCode,
    matchStatus,
    matchedPaymentId,
    errorMessage,
    receivedAt: input.receivedAt,
    processedAt: new Date().toISOString(),
    rawPayload: input.rawPayload
  });

  return { inboundEmail, matched: matchStatus === "matched", paymentId: matchedPaymentId };
}

// ---------------------------------------------------------------------------
// Manual match (triage UI)
// ---------------------------------------------------------------------------

export async function matchInboundEmailToInvoice(
  inboundEmailId: string,
  invoiceId: string,
  matchedByAdminId: string | null
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: inboundRow, error: inErr } = await supabase
    .from("inbound_emails")
    .select("*")
    .eq("id", inboundEmailId)
    .maybeSingle();
  if (inErr || !inboundRow) throw new Error("Inbound email not found.");
  const inbound = rowToInboundEmail(inboundRow as InboundEmailRow);

  const { data: invRow, error: invErr } = await supabase
    .from("invoices")
    .select("id, reference_code, amount_due, amount_paid")
    .eq("id", invoiceId)
    .maybeSingle();
  if (invErr || !invRow) throw new Error("Invoice not found.");
  const invoice = invRow as InvoiceRow;

  if (inbound.parsedAmount == null) {
    throw new Error("This email's amount could not be parsed — record manually instead.");
  }

  const payment = await recordPayment({
    invoiceId: invoice.id,
    method: "etransfer",
    amount: inbound.parsedAmount,
    status: "received",
    externalRef: inbound.gmailMessageId,
    senderName: inbound.parsedSenderName,
    senderEmail: null,
    senderMemo: inbound.parsedMemo,
    receivedAt: inbound.receivedAt,
    matchedBy: matchedByAdminId,
    notes: `Manually matched from inbox by admin to ${invoice.reference_code}`,
    rawPayload: inbound.rawPayload
  });

  await updateInboundEmailMatch(inbound.id, {
    matchStatus: "matched",
    matchedPaymentId: payment.id
  });

  // Fire payment_confirmation if this manual match flipped the invoice to paid.
  try {
    const ctx = await loadRegistrationContextByInvoice(invoice.id);
    if (ctx && ctx.invoice.status === "paid") {
      void notify
        .paymentConfirmation(ctx, { amountPaid: inbound.parsedAmount, method: "etransfer" })
        .catch((err) => console.warn("[matchInboundEmailToInvoice] notify failed:", err));
    }
  } catch (err) {
    console.warn("[matchInboundEmailToInvoice] notify lookup failed:", err);
  }
}

export async function markInboundEmailNotPayment(id: string): Promise<void> {
  await updateInboundEmailMatch(id, {
    matchStatus: "not_payment",
    matchedPaymentId: null,
    errorMessage: "Marked as not a payment by admin."
  });
}
