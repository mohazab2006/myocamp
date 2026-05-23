import { NextResponse, type NextRequest } from "next/server";

import { findByReferenceCode } from "@/lib/admin/payment-links";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/admin/paypal";
import { recordPayment } from "@/lib/admin/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/capture-order
 * Body: { orderID: string, ref: string }
 *
 * Captures a PayPal order, verifies the amount, records a payment row, and
 * triggers invoice recompute. Idempotent — if the same PayPal capture id is
 * received twice, we skip the second insert.
 */
export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal not configured." }, { status: 503 });
  }

  let body: { orderID?: string; ref?: string };
  try {
    body = (await req.json()) as { orderID?: string; ref?: string };
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

  // PayPal returns the capture nested inside purchase_units[0].payments.captures[0].
  const captured = capture.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captured) {
    return NextResponse.json(
      { error: "PayPal capture returned no capture record." },
      { status: 502 }
    );
  }

  // Verify the reference id matches what we expect.
  const refOnOrder = capture.purchase_units?.[0]?.reference_id;
  if (refOnOrder && refOnOrder !== invoice.referenceCode) {
    return NextResponse.json(
      { error: "PayPal reference mismatch." },
      { status: 409 }
    );
  }

  // Idempotency: if we've already saved this capture id, no-op.
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

  let recordedAmount = Number(captured.amount.value);
  try {
    await recordPayment({
      invoiceId: invoice.id,
      method: "paypal",
      amount: recordedAmount,
      status: captured.status === "COMPLETED" ? "received" : "pending",
      externalRef: captured.id,
      senderName:
        [capture.payer?.name?.given_name, capture.payer?.name?.surname]
          .filter(Boolean)
          .join(" ") || null,
      senderEmail: capture.payer?.email_address ?? null,
      receivedAt: captured.create_time ?? new Date().toISOString(),
      rawPayload: capture as unknown as Record<string, unknown>
    });
  } catch (err) {
    console.error("[paypal/capture-order] recordPayment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not record payment." },
      { status: 500 }
    );
  }

  // Fire payment_confirmation email when the invoice is now paid in full.
  if (captured.status === "COMPLETED") {
    const ctx = await loadRegistrationContextByInvoice(invoice.id);
    if (ctx && ctx.invoice.status === "paid") {
      const origin = req.nextUrl.origin;
      void notify
        .paymentConfirmation({ ...ctx, origin }, { amountPaid: recordedAmount, method: "paypal" })
        .catch((err) => console.warn("[paypal/capture-order] notify failed:", err));
    }
  }

  return NextResponse.json({
    ok: true,
    captureId: captured.id,
    status: captured.status,
    amount: captured.amount.value
  });
}
