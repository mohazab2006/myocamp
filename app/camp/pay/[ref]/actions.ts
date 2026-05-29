"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordSplitFamilyPayment } from "@/lib/admin/family-billing";
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

  const familyRefsRaw = value(formData, "familyRefs");
  const familyRefs = familyRefsRaw
    ? familyRefsRaw
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];
  const isFamily = familyRefs.length > 1;

  const lookup = await findByReferenceCode(ref);
  if (!lookup) redirect("/camp");

  const { invoice, registration } = lookup;

  if (registration.status === "cancelled") {
    redirect(`/camp/pay/${ref}?status=cancelled`);
  }

  const remaining = Number((invoice.amountDue - invoice.amountPaid).toFixed(2));

  try {
    if (isFamily) {
      const lookups = await Promise.all(familyRefs.map((code) => findByReferenceCode(code)));
      const valid = lookups.filter((l): l is NonNullable<typeof l> => l != null);
      if (valid.length === 0) redirect(`/camp/pay/${ref}?status=error`);

      const invoiceIds: string[] = [];
      const amountsByInvoice = new Map<string, number>();
      let total = 0;

      for (const row of valid) {
        if (row.registration.status === "cancelled") continue;
        const rowRemaining = Number(
          (row.invoice.amountDue - row.invoice.amountPaid).toFixed(2)
        );
        if (rowRemaining <= 0) continue;
        invoiceIds.push(row.invoice.id);
        amountsByInvoice.set(row.invoice.id, rowRemaining);
        total = Number((total + rowRemaining).toFixed(2));
      }

      if (total <= 0) {
        redirect(`/camp/pay/${ref}?status=already-paid`);
      }

      await recordSplitFamilyPayment(invoiceIds, total, {
        method: "cash",
        status: "received",
        cashReceived: false,
        senderName: registration.parentName,
        senderEmail: registration.parentEmail,
        notes: `Cash pledged via public payment page — family (${familyRefs.join(", ")})`,
        rawPayload: { _publicCashPledge: true, ref, familyRefs }
      });

      for (const invoiceId of invoiceIds) {
        const ctx = await loadRegistrationContextByInvoice(invoiceId);
        const amountPaid = amountsByInvoice.get(invoiceId) ?? 0;
        if (ctx && ctx.invoice.status === "paid" && amountPaid > 0) {
          try {
            await notify.paymentConfirmation(ctx, { amountPaid, method: "cash" });
          } catch (err) {
            console.warn("[commitCashPaymentAction] family notify failed:", err);
          }
        }
      }

      revalidatePath(`/camp/pay/${ref}`);
      redirect(`/camp/pay/${ref}?status=cash-pledged`);
    }

    if (remaining <= 0) {
      redirect(`/camp/pay/${ref}?status=already-paid`);
    }

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

    const ctx = await loadRegistrationContextByInvoice(invoice.id);
    if (ctx && ctx.invoice.status === "paid") {
      try {
        await notify.paymentConfirmation(ctx, { amountPaid: remaining, method: "cash" });
      } catch (err) {
        console.warn("[commitCashPaymentAction] notify failed:", err);
      }
    }
  } catch (err) {
    console.error("[commitCashPaymentAction] error:", err);
    redirect(`/camp/pay/${ref}?status=error`);
  }

  revalidatePath(`/camp/pay/${ref}`);
  redirect(`/camp/pay/${ref}?status=cash-pledged`);
}
