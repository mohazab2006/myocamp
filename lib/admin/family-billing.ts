import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CamperInfo } from "@/lib/types";
import { recordPayment, type RecordPaymentInput } from "@/lib/admin/payments";

export type FamilyBillingLine = {
  registrationId: string;
  invoiceId: string;
  referenceCode: string;
  camperLabel: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
  isCurrent: boolean;
};

type RegistrationRow = {
  id: string;
  parent_email: string | null;
  campers: CamperInfo[] | null;
  submitted_at: string;
  invoices: Array<{
    id: string;
    reference_code: string;
    amount_due: number | string;
    amount_paid: number | string;
    status: string;
  }> | null;
};

function camperLabel(campers: CamperInfo[] | null): string {
  if (!Array.isArray(campers) || campers.length === 0) return "Camper";
  const first = campers[0]?.name?.trim();
  if (!first) return campers.length > 1 ? `${campers.length} campers` : "Camper";
  return campers.length > 1 ? `${first} +${campers.length - 1}` : first;
}

/** Unpaid/partial invoices for the same camp + parent email (one form per child, one family payment). */
export async function fetchFamilyBillingLines(
  campId: string,
  parentEmail: string | null,
  currentInvoiceId: string
): Promise<FamilyBillingLine[]> {
  const email = parentEmail?.trim();
  if (!email) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, parent_email, campers, submitted_at, invoices ( id, reference_code, amount_due, amount_paid, status )"
    )
    .eq("camp_id", campId)
    .eq("status", "active")
    .ilike("parent_email", email)
    .order("submitted_at", { ascending: true });

  if (error || !data) return [];

  const lines: FamilyBillingLine[] = [];
  for (const row of data as RegistrationRow[]) {
    const inv = row.invoices?.[0];
    if (!inv) continue;
    if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "refunded") continue;

    const amountDue = Number(inv.amount_due);
    const amountPaid = Number(inv.amount_paid);
    const remaining = Number((amountDue - amountPaid).toFixed(2));
    if (remaining <= 0) continue;

    lines.push({
      registrationId: row.id,
      invoiceId: inv.id,
      referenceCode: inv.reference_code,
      camperLabel: camperLabel(row.campers),
      amountDue,
      amountPaid,
      remaining,
      isCurrent: inv.id === currentInvoiceId
    });
  }

  return lines;
}

export function familyTotalRemaining(lines: FamilyBillingLine[]): number {
  return Number(lines.reduce((sum, line) => sum + line.remaining, 0).toFixed(2));
}

export function familyReferenceCodes(lines: FamilyBillingLine[]): string[] {
  return lines.map((l) => l.referenceCode);
}

/** e-Transfer memo: reference + camper name so admin can match even without auto-ref. */
export function formatEtransferMemo(referenceCode: string, camperLabel: string): string {
  const name = camperLabel.trim();
  if (!name || name === "your camper" || name === "Camper") return referenceCode;
  const firstName = name.split(/\s+/)[0] ?? name;
  return `${referenceCode} ${firstName}`;
}

export function formatFamilyMemo(lines: FamilyBillingLine[]): string {
  return lines.map((l) => formatEtransferMemo(l.referenceCode, l.camperLabel)).join(", ");
}

/** Apply one payment across multiple invoices (oldest registration first). */
export async function recordSplitFamilyPayment(
  invoiceIds: string[],
  totalAmount: number,
  common: Omit<RecordPaymentInput, "invoiceId" | "amount">
): Promise<{ paymentIds: string[]; applied: number }> {
  const supabase = createSupabaseAdminClient();
  const uniqueIds = [...new Set(invoiceIds.filter(Boolean))];
  if (uniqueIds.length === 0) throw new Error("No invoices to pay.");

  const { data: rows, error } = await supabase
    .from("invoices")
    .select("id, amount_due, amount_paid, registration_id, registrations ( submitted_at )")
    .in("id", uniqueIds);

  if (error || !rows?.length) throw new Error("Could not load family invoices.");

  type InvRow = {
    id: string;
    amount_due: number | string;
    amount_paid: number | string;
    registration_id: string;
    registrations: { submitted_at: string } | { submitted_at: string }[] | null;
  };

  const sorted = (rows as InvRow[]).slice().sort((a, b) => {
    const aReg = Array.isArray(a.registrations) ? a.registrations[0] : a.registrations;
    const bReg = Array.isArray(b.registrations) ? b.registrations[0] : b.registrations;
    const aTime = aReg?.submitted_at ?? "";
    const bTime = bReg?.submitted_at ?? "";
    return aTime.localeCompare(bTime);
  });

  let left = Number(totalAmount.toFixed(2));
  const paymentIds: string[] = [];

  for (const inv of sorted) {
    if (left <= 0) break;
    const due = Number(inv.amount_due);
    const paid = Number(inv.amount_paid);
    const remaining = Number((due - paid).toFixed(2));
    if (remaining <= 0) continue;

    const slice = Number(Math.min(remaining, left).toFixed(2));
    if (slice <= 0) continue;

    const payment = await recordPayment({
      ...common,
      invoiceId: inv.id,
      amount: slice
    });
    paymentIds.push(payment.id);
    left = Number((left - slice).toFixed(2));
  }

  return { paymentIds, applied: Number((totalAmount - left).toFixed(2)) };
}
