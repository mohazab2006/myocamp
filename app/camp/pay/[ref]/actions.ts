"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { findByReferenceCode } from "@/lib/admin/payment-links";
import { recordPayment } from "@/lib/admin/payments";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Public cash payment action.
 *
 * Records a `cash` payment with `cash_received = false` so the invoice flips
 * to "paid" (we trust the parent will bring cash) but the owner sees it in
 * the "Cash to collect" filter until the cash is actually in hand.
 *
 * Confirmed in the user spec:
 *   "for cash it auto marks paid when they pick that option, it just assumes
 *    they will pay the cash and specifies its cash"
 */
export async function commitCashPaymentAction(formData: FormData) {
  const ref = value(formData, "ref");
  if (!ref) redirect("/camp");

  const lookup = await findByReferenceCode(ref);
  if (!lookup) redirect("/camp");

  const { invoice, registration } = lookup;

  if (registration.status === "cancelled") {
    redirect(`/camp/pay/${ref}?status=cancelled`);
  }

  const remaining = Number((invoice.amountDue - invoice.amountPaid).toFixed(2));
  if (remaining <= 0) {
    redirect(`/camp/pay/${ref}?status=already-paid`);
  }

  try {
    await recordPayment({
      invoiceId: invoice.id,
      method: "cash",
      amount: remaining,
      status: "received",
      cashReceived: false,
      senderName: registration.parentName,
      senderEmail: registration.parentEmail,
      notes: "Cash pledged via public payment page (collect at drop-off)",
      rawPayload: { _publicCashPledge: true, ref }
    });
  } catch (err) {
    console.error("[commitCashPaymentAction] error:", err);
    redirect(`/camp/pay/${ref}?status=error`);
  }

  // Send payment_confirmation if the cash pledge brought the invoice to paid.
  try {
    const ctx = await loadRegistrationContextByInvoice(invoice.id);
    if (ctx && ctx.invoice.status === "paid") {
      void notify
        .paymentConfirmation(ctx, { amountPaid: remaining, method: "cash" })
        .catch((err) => console.warn("[commitCashPaymentAction] notify failed:", err));
    }
  } catch (err) {
    console.warn("[commitCashPaymentAction] notify lookup failed:", err);
  }

  revalidatePath(`/camp/pay/${ref}`);
  redirect(`/camp/pay/${ref}?status=cash-pledged`);
}
