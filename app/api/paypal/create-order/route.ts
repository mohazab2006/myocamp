import { NextResponse, type NextRequest } from "next/server";

import {
  familyTotalRemaining,
  type FamilyBillingLine
} from "@/lib/admin/family-billing";
import { findByReferenceCode } from "@/lib/admin/payment-links";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/admin/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadFamilyCharge(
  primaryRef: string,
  familyRefs?: string[]
): Promise<{
  remaining: number;
  referenceCodes: string[];
  campTitle: string;
  primaryReference: string;
} | null> {
  const primary = await findByReferenceCode(primaryRef);
  if (!primary) return null;

  const refs = familyRefs?.length ? familyRefs : [primaryRef];
  const lookups = await Promise.all(refs.map((r) => findByReferenceCode(r)));
  const valid = lookups.filter((l): l is NonNullable<typeof l> => l != null);

  if (valid.length === 0) return null;

  const lines: FamilyBillingLine[] = valid.map((l) => ({
    registrationId: l.registration.id,
    invoiceId: l.invoice.id,
    referenceCode: l.invoice.referenceCode,
    camperLabel: "",
    amountDue: l.invoice.amountDue,
    amountPaid: l.invoice.amountPaid,
    remaining: Number((l.invoice.amountDue - l.invoice.amountPaid).toFixed(2)),
    isCurrent: l.invoice.referenceCode === primaryRef
  }));

  const remaining = familyTotalRemaining(lines.filter((l) => l.remaining > 0));
  return {
    remaining,
    referenceCodes: lines.map((l) => l.referenceCode),
    campTitle: primary.camp.title,
    primaryReference: primary.invoice.referenceCode
  };
}

/**
 * POST /api/paypal/create-order
 * Body: { ref: string, familyRefs?: string[] }
 */
export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured on this server." },
      { status: 503 }
    );
  }

  let body: { ref?: string; familyRefs?: string[] };
  try {
    body = (await req.json()) as { ref?: string; familyRefs?: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ref = body.ref?.trim();
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const lookup = await findByReferenceCode(ref);
  if (!lookup) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const { registration, camp } = lookup;

  if (registration.status === "cancelled") {
    return NextResponse.json(
      { error: "This registration was cancelled. Contact the camp organizer." },
      { status: 409 }
    );
  }

  const charge = await loadFamilyCharge(ref, body.familyRefs);
  if (!charge || charge.remaining <= 0) {
    return NextResponse.json(
      { error: "This invoice is already paid in full." },
      { status: 409 }
    );
  }

  const description =
    charge.referenceCodes.length > 1
      ? `${camp.title} — family payment (${charge.referenceCodes.join(", ")})`
      : `${camp.title} — ${charge.primaryReference}`;

  try {
    const order = await createPayPalOrder({
      amount: charge.remaining,
      currency: "CAD",
      referenceId: charge.primaryReference,
      description,
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
