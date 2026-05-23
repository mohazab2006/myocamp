import { NextResponse, type NextRequest } from "next/server";

import { findByReferenceCode } from "@/lib/admin/payment-links";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/admin/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/create-order
 * Body: { ref: string }
 *
 * Looks up the invoice by reference code, creates a PayPal order for the
 * remaining balance, and returns { id } back to the browser SDK.
 */
export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured on this server." },
      { status: 503 }
    );
  }

  let body: { ref?: string };
  try {
    body = (await req.json()) as { ref?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ref = body.ref?.trim();
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const lookup = await findByReferenceCode(ref);
  if (!lookup) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const { invoice, registration, camp } = lookup;

  if (registration.status === "cancelled") {
    return NextResponse.json(
      { error: "This registration was cancelled. Contact the camp organizer." },
      { status: 409 }
    );
  }

  const remaining = Number((invoice.amountDue - invoice.amountPaid).toFixed(2));
  if (remaining <= 0) {
    return NextResponse.json(
      { error: "This invoice is already paid in full." },
      { status: 409 }
    );
  }

  try {
    const order = await createPayPalOrder({
      amount: remaining,
      currency: "CAD",
      referenceId: invoice.referenceCode,
      description: `${camp.title} — ${invoice.referenceCode}`,
      payeeEmail: lookup.paymentEmail
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("[paypal/create-order] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PayPal create order failed" },
      { status: 502 }
    );
  }
}
