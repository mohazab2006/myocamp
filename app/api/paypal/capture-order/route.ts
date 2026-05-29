import { NextResponse, type NextRequest } from "next/server";

import { recordSplitFamilyPayment } from "@/lib/admin/family-billing";
import { findByReferenceCode } from "@/lib/admin/payment-links";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/admin/paypal";
import { recordPayment } from "@/lib/admin/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/capture-order
 * Body: { orderID: string, ref: string, familyRefs?: string[] }
 */
export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal not configured." }, { status: 503 });
  }

  let body: { orderID?: string; ref?: string; familyRefs?: string[] };
  try {
    body = (await req.json()) as { orderID?: string; ref?: string; familyRefs?: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = body.orderID?.trim();
  const ref = body.ref?.trim();
  if (!orderId || !ref) {
    return NextResponse.json({ error: "Missing orderID or ref" }, { status: 400 });
  }

  const lookup = await findByReferenceCode(ref);
  if (!lookup) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const { invoice } = lookup;
  const familyRefs = body.familyRefs?.filter(Boolean) ?? [];
  const isFamily = familyRefs.length > 1;

  let capture;
  try {
    capture = await capturePayPalOrder(orderId);
  } catch (err) {
    console.error("[paypal/capture-order] capture error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PayPal capture failed" },
      { status: 502 }
    );
  }

  const captured = capture.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captured) {
    return NextResponse.json(
      { error: "PayPal capture returned no capture record." },
      { status: 502 }
    );
  }

  const refOnOrder = capture.purchase_units?.[0]?.reference_id;
  if (refOnOrder && refOnOrder !== invoice.referenceCode) {
    return NextResponse.json({ error: "PayPal reference mismatch." }, { status: 409 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("method", "paypal")
    .eq("external_ref", captured.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      captureId: captured.id,
      status: captured.status
    });
  }

  const recordedAmount = Number(captured.amount.value);
  const payerCommon = {
    senderName:
      [capture.payer?.name?.given_name, capture.payer?.name?.surname].filter(Boolean).join(" ") ||
      null,
    senderEmail: capture.payer?.email_address ?? null,
    receivedAt: captured.create_time ?? new Date().toISOString(),
    rawPayload: capture as unknown as Record<string, unknown>,
    status: captured.status === "COMPLETED" ? ("received" as const) : ("pending" as const)
  };

  try {
    if (isFamily) {
      const lookups = await Promise.all(familyRefs.map((r) => findByReferenceCode(r)));
      const invoiceIds = lookups
        .filter((l): l is NonNullable<typeof l> => l != null)
        .map((l) => l.invoice.id);

      await recordSplitFamilyPayment(invoiceIds, recordedAmount, {
        method: "paypal",
        externalRef: captured.id,
        ...payerCommon,
        notes: `PayPal family payment (${familyRefs.join(", ")})`
      });
    } else {
      await recordPayment({
        invoiceId: invoice.id,
        method: "paypal",
        amount: recordedAmount,
        externalRef: captured.id,
        ...payerCommon
      });
    }
  } catch (err) {
    console.error("[paypal/capture-order] recordPayment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not record payment." },
      { status: 500 }
    );
  }

  if (captured.status === "COMPLETED") {
    const notifyIds = isFamily
      ? (
          await Promise.all(familyRefs.map((r) => findByReferenceCode(r)))
        )
          .filter((l): l is NonNullable<typeof l> => l != null)
          .map((l) => l.invoice.id)
      : [invoice.id];

    const origin = req.nextUrl.origin;
    for (const invoiceId of notifyIds) {
      const ctx = await loadRegistrationContextByInvoice(invoiceId);
      if (ctx && ctx.invoice.status === "paid") {
        void notify
          .paymentConfirmation({ ...ctx, origin }, { amountPaid: recordedAmount, method: "paypal" })
          .catch((err) => console.warn("[paypal/capture-order] notify failed:", err));
      }
    }
  }

  return NextResponse.json({
    ok: true,
    captureId: captured.id,
    status: captured.status,
    amount: captured.amount.value
  });
}
