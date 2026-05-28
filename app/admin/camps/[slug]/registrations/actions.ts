"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import { fetchCampBySlug } from "@/lib/admin/camps";
import {
  cancelRegistration,
  createRegistrationWithInvoice,
  fetchRegistrationById,
  reactivateRegistration,
  updateRegistrationContact,
  updateRegistrationNotes
} from "@/lib/admin/registrations";
import {
  recordPayment,
  recomputeInvoiceTotals,
  updateCashReceived,
  voidPayment,
  type RecordPaymentInput
} from "@/lib/admin/payments";
import {
  loadRegistrationContextByInvoice,
  notify
} from "@/lib/email/notifications";
import { setInvoiceRemindersPaused } from "@/lib/admin/reminder-log";
import type { PaymentMethod } from "@/lib/types";

// ---------------------------------------------------------------------------
// Tiny helpers (mirroring app/admin/camps/actions.ts conventions)
// ---------------------------------------------------------------------------

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function optional(formData: FormData, key: string) {
  const v = value(formData, key);
  return v === "" ? null : v;
}
function numberOrNull(formData: FormData, key: string): number | null {
  const v = value(formData, key);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

function regUrl(slug: string, regId: string, tab?: string) {
  return tab ? `/admin/camps/${slug}/registrations/${regId}?tab=${tab}` : `/admin/camps/${slug}/registrations/${regId}`;
}

// ---------------------------------------------------------------------------
// Manually add a registration (no JotForm — owner is entering by hand)
// ---------------------------------------------------------------------------

export async function createManualRegistrationAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const slug = value(formData, "slug");
  const camp = await fetchCampBySlug(slug);
  if (!camp) flash("/admin/camps", "error", "Camp not found.");

  const parentName = optional(formData, "parentName");
  const parentEmail = optional(formData, "parentEmail");
  const parentPhone = optional(formData, "parentPhone");
  const camperName = optional(formData, "camperName");
  const camperAge = numberOrNull(formData, "camperAge");
  const camperCount = Math.max(1, numberOrNull(formData, "camperCount") ?? 1);
  const notes = optional(formData, "notes");

  if (!parentName && !parentEmail) {
    flash(
      `/admin/camps/${slug}?tab=registrations`,
      "error",
      "Add at least a parent name or email so we can identify the registration."
    );
  }

  const campers = [];
  if (camperName) {
    campers.push({ name: camperName, age: camperAge ?? undefined });
  }
  for (let i = campers.length; i < camperCount; i++) {
    campers.push({ name: `Camper ${i + 1}` });
  }

  try {
    const result = await createRegistrationWithInvoice({
      campId: camp.id,
      campStartYear: new Date(camp.startDate).getUTCFullYear(),
      feePerCamper: camp.feePerCamper,
      source: "manual",
      jotformSubmissionId: null,
      parentName,
      parentEmail,
      parentPhone,
      campers,
      rawPayload: { _manualEntry: true },
      notes
    });

    revalidatePath(`/admin/camps/${slug}`);
    revalidatePath("/admin/camps");
    if (!result.isNew) {
      flash(
        regUrl(slug, result.registration.id),
        "info",
        `This email already has an active registration · ${result.invoice.referenceCode}.`
      );
    } else {
      flash(
        regUrl(slug, result.registration.id),
        "success",
        `Added registration for ${parentName ?? parentEmail ?? "this family"} · ${result.invoice.referenceCode}.`
      );
    }
  } catch (err) {
    flash(
      `/admin/camps/${slug}?tab=registrations`,
      "error",
      err instanceof Error ? err.message : "Could not create registration."
    );
  }
}

// ---------------------------------------------------------------------------
// Edit contact + notes on a registration
// ---------------------------------------------------------------------------

export async function updateRegistrationDetailsAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const slug = value(formData, "slug");
  const id = value(formData, "id");
  if (!id) flash(`/admin/camps/${slug}?tab=registrations`, "error", "Missing registration id.");

  const parentName = optional(formData, "parentName");
  const parentEmail = optional(formData, "parentEmail");
  const parentPhone = optional(formData, "parentPhone");
  const notes = optional(formData, "notes");

  try {
    await updateRegistrationContact(id, { parentName, parentEmail, parentPhone });
    await updateRegistrationNotes(id, notes);
  } catch (err) {
    flash(
      regUrl(slug, id),
      "error",
      err instanceof Error ? err.message : "Could not update registration."
    );
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, id));
  flash(regUrl(slug, id), "success", "Registration updated.");
}

// ---------------------------------------------------------------------------
// Cancel + reactivate
// ---------------------------------------------------------------------------

export async function cancelRegistrationAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  const reason = optional(formData, "reason");
  if (!id) flash(`/admin/camps/${slug}?tab=registrations`, "error", "Missing registration id.");

  try {
    await cancelRegistration(id, reason);
  } catch (err) {
    flash(regUrl(slug, id), "error", err instanceof Error ? err.message : "Could not cancel.");
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, id));
  flash(`/admin/camps/${slug}?tab=registrations`, "success", "Registration cancelled.");
}

export async function reactivateRegistrationAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const id = value(formData, "id");
  if (!id) flash(`/admin/camps/${slug}?tab=registrations`, "error", "Missing registration id.");

  try {
    await reactivateRegistration(id);
  } catch (err) {
    flash(regUrl(slug, id), "error", err instanceof Error ? err.message : "Could not reactivate.");
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, id));
  flash(regUrl(slug, id), "success", "Registration reactivated.");
}

// ---------------------------------------------------------------------------
// Record a manual payment (cash / cheque / matched e-transfer)
// ---------------------------------------------------------------------------

export async function recordManualPaymentAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  if (!registrationId) {
    flash(`/admin/camps/${slug}?tab=registrations`, "error", "Missing registration id.");
  }

  const reg = await fetchRegistrationById(registrationId);
  if (!reg || !reg.invoice) {
    flash(
      regUrl(slug, registrationId),
      "error",
      "Couldn't find this registration's invoice."
    );
  }

  const methodRaw = (value(formData, "method") || "cash") as PaymentMethod;
  const validMethods: PaymentMethod[] = ["cash", "etransfer", "paypal", "stripe", "manual"];
  const method = validMethods.includes(methodRaw) ? methodRaw : "cash";

  const remaining = Number((reg!.invoice!.amountDue - reg!.invoice!.amountPaid).toFixed(2));
  const amountRaw = value(formData, "amount");
  const amount = amountRaw === "" ? remaining : Number(amountRaw);

  if (!Number.isFinite(amount) || amount <= 0) {
    flash(regUrl(slug, registrationId), "error", "Enter a positive payment amount.");
  }

  const payload: RecordPaymentInput = {
    invoiceId: reg!.invoice!.id,
    method,
    amount,
    senderName: optional(formData, "senderName"),
    senderEmail: optional(formData, "senderEmail"),
    senderMemo: optional(formData, "senderMemo"),
    externalRef: optional(formData, "externalRef"),
    notes: optional(formData, "notes"),
    cashReceived: method === "cash" ? formData.get("cashReceived") === "on" : null,
    rawPayload: { _manualEntry: true }
  };

  try {
    await recordPayment(payload);
  } catch (err) {
    flash(
      regUrl(slug, registrationId),
      "error",
      err instanceof Error ? err.message : "Could not record payment."
    );
  }

  // Fire payment_confirmation if this manual record brought the invoice to paid.
  try {
    const ctx = await loadRegistrationContextByInvoice(reg!.invoice!.id);
    if (ctx && ctx.invoice.status === "paid") {
      void notify
        .paymentConfirmation(ctx, { amountPaid: amount, method })
        .catch((err) => console.warn("[recordManualPaymentAction] notify failed:", err));
    }
  } catch (err) {
    console.warn("[recordManualPaymentAction] notify lookup failed:", err);
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, registrationId));

  const label =
    method === "cash"
      ? "Cash payment recorded."
      : method === "etransfer"
        ? "E-transfer payment recorded."
        : `${method} payment recorded.`;
  flash(regUrl(slug, registrationId), "success", label);
}

// ---------------------------------------------------------------------------
// Send registration confirmation (reference + payment link)
// ---------------------------------------------------------------------------

export async function sendRegistrationEmailAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const invoiceId = value(formData, "invoiceId");
  if (!invoiceId) {
    flash(regUrl(slug, registrationId), "error", "Missing invoice id.");
  }

  const ctx = await loadRegistrationContextByInvoice(invoiceId);
  if (!ctx) {
    flash(regUrl(slug, registrationId), "error", "Could not load registration.");
  }

  if (!ctx!.registration.parentEmail) {
    flash(
      regUrl(slug, registrationId),
      "error",
      "No parent email on file. Add one above, or copy the payment link manually."
    );
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "myo.camp";
  const proto =
    hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const result = await notify.registrationReceived({ ...ctx!, origin });

  revalidatePath(regUrl(slug, registrationId));
  if (result.ok) {
    flash(
      regUrl(slug, registrationId),
      "success",
      `Confirmation email sent to ${ctx!.registration.parentEmail} with reference ${ctx!.invoice.referenceCode}.`
    );
  } else {
    flash(
      regUrl(slug, registrationId),
      "error",
      `Could not send email: ${result.reason ?? "unknown error"}. Set RESEND_API_KEY on Vercel, or copy the payment link below.`
    );
  }
}

// ---------------------------------------------------------------------------
// Send a reminder email NOW (the [Resend] button)
// ---------------------------------------------------------------------------

export async function sendReminderNowAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const invoiceId = value(formData, "invoiceId");
  if (!invoiceId) {
    flash(regUrl(slug, registrationId), "error", "Missing invoice id.");
  }

  const ctx = await loadRegistrationContextByInvoice(invoiceId);
  if (!ctx) {
    flash(regUrl(slug, registrationId), "error", "Could not load invoice context.");
  }

  if (ctx!.invoice.status === "paid") {
    flash(regUrl(slug, registrationId), "info", "This invoice is already paid — no reminder sent.");
  }

  if (!ctx!.registration.parentEmail) {
    flash(
      regUrl(slug, registrationId),
      "error",
      "No parent email on this registration. Add one before sending a reminder."
    );
  }

  const result = await notify.invoiceReminder(ctx!, { kind: "manual" });

  revalidatePath(regUrl(slug, registrationId));
  if (result.ok) {
    flash(regUrl(slug, registrationId), "success", `Reminder sent to ${ctx!.registration.parentEmail}.`);
  } else {
    flash(
      regUrl(slug, registrationId),
      "error",
      `Could not send reminder: ${result.reason ?? "unknown error"}.`
    );
  }
}

// ---------------------------------------------------------------------------
// Toggle auto-reminders paused/resumed for an invoice
// ---------------------------------------------------------------------------

export async function toggleRemindersPausedAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const invoiceId = value(formData, "invoiceId");
  const paused = formData.get("paused") === "true";

  if (!invoiceId) {
    flash(regUrl(slug, registrationId), "error", "Missing invoice id.");
  }

  try {
    await setInvoiceRemindersPaused(invoiceId, paused);
  } catch (err) {
    flash(
      regUrl(slug, registrationId),
      "error",
      err instanceof Error ? err.message : "Could not update reminder pause."
    );
  }

  revalidatePath(regUrl(slug, registrationId));
  flash(
    regUrl(slug, registrationId),
    "success",
    paused ? "Auto reminders paused for this invoice." : "Auto reminders resumed."
  );
}

// ---------------------------------------------------------------------------
// Toggle cash_received on a cash payment row
// ---------------------------------------------------------------------------

export async function toggleCashReceivedAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const paymentId = value(formData, "paymentId");
  const received = formData.get("received") === "on" || formData.get("received") === "true";

  if (!paymentId) {
    flash(regUrl(slug, registrationId), "error", "Missing payment id.");
  }

  try {
    await updateCashReceived(paymentId, received);
  } catch (err) {
    flash(
      regUrl(slug, registrationId),
      "error",
      err instanceof Error ? err.message : "Could not update."
    );
  }

  revalidatePath(regUrl(slug, registrationId));
  flash(
    regUrl(slug, registrationId, "payments"),
    "success",
    received ? "Marked cash as collected." : "Marked cash as awaiting pickup."
  );
}

// ---------------------------------------------------------------------------
// Void a payment (refund row)
// ---------------------------------------------------------------------------

export async function voidPaymentAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const paymentId = value(formData, "paymentId");

  if (!paymentId) {
    flash(regUrl(slug, registrationId), "error", "Missing payment id.");
  }

  try {
    await voidPayment(paymentId);
  } catch (err) {
    flash(
      regUrl(slug, registrationId),
      "error",
      err instanceof Error ? err.message : "Could not void payment."
    );
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, registrationId));
  flash(regUrl(slug, registrationId, "payments"), "success", "Payment voided.");
}

// ---------------------------------------------------------------------------
// Force-recompute invoice totals (debug button on detail page)
// ---------------------------------------------------------------------------

export async function recomputeInvoiceAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const slug = value(formData, "slug");
  const registrationId = value(formData, "registrationId");
  const invoiceId = value(formData, "invoiceId");

  if (!invoiceId) {
    flash(regUrl(slug, registrationId), "error", "Missing invoice id.");
  }

  try {
    await recomputeInvoiceTotals(invoiceId);
  } catch (err) {
    flash(
      regUrl(slug, registrationId),
      "error",
      err instanceof Error ? err.message : "Could not recompute."
    );
  }

  revalidatePath(`/admin/camps/${slug}`);
  revalidatePath(regUrl(slug, registrationId));
  flash(regUrl(slug, registrationId), "success", "Invoice totals recomputed.");
}
