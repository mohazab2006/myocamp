import Link from "next/link";
import {
  CheckCircle,
  Circle,
  Coins,
  CurrencyDollarSimple,
  Money,
  Wallet,
  Warning,
  XCircle
} from "@phosphor-icons/react/ssr";

import type { Invoice, Payment, Registration } from "@/lib/types";

export interface RegistrationRowData {
  registration: Registration;
  invoice: Invoice | null;
  topPayment?: Payment | null; // optional latest payment to derive method label
}

interface RegistrationsTableProps {
  campSlug: string;
  rows: RegistrationRowData[];
  filter: FilterKey;
}

export type FilterKey = "all" | "paid" | "unpaid" | "cash" | "partial" | "cancelled";

export const REGISTRATION_FILTERS: ReadonlyArray<{
  key: FilterKey;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "paid", label: "Paid" },
  { key: "partial", label: "Partial" },
  { key: "cash", label: "Cash to collect" },
  { key: "cancelled", label: "Cancelled" }
];

export function filterRegistrations(
  rows: RegistrationRowData[],
  filter: FilterKey
): RegistrationRowData[] {
  switch (filter) {
    case "all":
      return rows.filter((r) => r.registration.status !== "cancelled");
    case "paid":
      return rows.filter(
        (r) => r.registration.status !== "cancelled" && r.invoice?.status === "paid"
      );
    case "unpaid":
      return rows.filter(
        (r) =>
          r.registration.status !== "cancelled" &&
          (r.invoice?.status === "pending" || !r.invoice)
      );
    case "partial":
      return rows.filter(
        (r) => r.registration.status !== "cancelled" && r.invoice?.status === "partial"
      );
    case "cash":
      // Any unpaid invoice whose top payment was a cash record awaiting pickup,
      // OR an "active" registration whose method is cash and isn't fully paid.
      return rows.filter((r) => {
        if (r.registration.status === "cancelled") return false;
        const cashAwaiting =
          r.topPayment?.method === "cash" && r.topPayment.cashReceived === false;
        return cashAwaiting;
      });
    case "cancelled":
      return rows.filter((r) => r.registration.status === "cancelled");
    default:
      return rows;
  }
}

function fmt(amount: number) {
  return amount.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function statusIcon(row: RegistrationRowData) {
  if (row.registration.status === "cancelled") {
    return <XCircle size={18} weight="duotone" className="text-ink-soft" aria-label="Cancelled" />;
  }
  if (!row.invoice) {
    return <Warning size={18} weight="duotone" className="text-brass" aria-label="No invoice" />;
  }
  if (row.invoice.status === "paid") {
    return <CheckCircle size={18} weight="fill" className="text-pine" aria-label="Paid" />;
  }
  if (row.invoice.status === "partial") {
    return <Coins size={18} weight="duotone" className="text-brass" aria-label="Partial" />;
  }
  return <Circle size={18} weight="duotone" className="text-ink-soft" aria-label="Unpaid" />;
}

function methodBadge(row: RegistrationRowData) {
  if (row.registration.status === "cancelled") {
    return <Tag tone="muted" label="Cancelled" />;
  }
  if (!row.invoice) return <Tag tone="warn" label="No invoice" />;

  if (row.invoice.status === "paid") {
    const m = row.topPayment?.method;
    if (m === "cash") return <Tag tone="ok" icon={<Money size={11} weight="bold" />} label="Cash" />;
    if (m === "paypal")
      return <Tag tone="ok" icon={<Wallet size={11} weight="bold" />} label="PayPal" />;
    if (m === "stripe")
      return <Tag tone="ok" icon={<CurrencyDollarSimple size={11} weight="bold" />} label="Stripe" />;
    if (m === "etransfer")
      return <Tag tone="ok" icon={<CurrencyDollarSimple size={11} weight="bold" />} label="e-Transfer" />;
    return <Tag tone="ok" label="Paid" />;
  }

  if (row.invoice.status === "partial") {
    return <Tag tone="warn" label={`Partial · ${fmt(row.invoice.amountPaid)}`} />;
  }

  // pending
  if (row.topPayment?.method === "cash" && row.topPayment.cashReceived === false) {
    return <Tag tone="warn" icon={<Money size={11} weight="bold" />} label="Cash to collect" />;
  }
  return <Tag tone="muted" label="Unpaid" />;
}

interface TagProps {
  tone: "ok" | "warn" | "muted";
  label: string;
  icon?: React.ReactNode;
}
function Tag({ tone, label, icon }: TagProps) {
  const tones: Record<TagProps["tone"], string> = {
    ok: "border-pine/40 bg-sky/55 text-forest",
    warn: "border-brass/40 bg-brass/15 text-ink",
    muted: "border-line bg-paper-deep/60 text-ink-soft"
  };
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 border px-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function RegistrationsTable({ campSlug, rows, filter }: RegistrationsTableProps) {
  const filtered = filterRegistrations(rows, filter);

  if (filtered.length === 0) {
    return (
      <div className="border border-dashed border-line bg-paper-deep/15 p-10 text-center">
        <p className="font-display text-lg tracking-tight text-ink">No matching registrations</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          {filter === "all"
            ? "No registrations yet. Once parents submit your JotForm, they'll appear here."
            : "Try switching the filter above."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-paper">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper-deep/40 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <th className="px-3 py-3 font-semibold" aria-label="Status" />
            <th className="px-3 py-3 font-semibold">Family</th>
            <th className="px-3 py-3 font-semibold">Camper</th>
            <th className="px-3 py-3 text-right font-semibold">Amount</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Ref</th>
            <th className="px-3 py-3 font-semibold">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => {
            const reg = row.registration;
            const inv = row.invoice;
            const firstCamper = reg.campers[0];
            const camperLabel = firstCamper?.name
              ? reg.campers.length > 1
                ? `${firstCamper.name} +${reg.campers.length - 1}`
                : firstCamper.name
              : "—";

            return (
              <tr key={reg.id} className="border-b border-line/60 transition hover:bg-paper-deep/35">
                <td className="px-3 py-3 align-top">{statusIcon(row)}</td>
                <td className="px-3 py-3 align-top">
                  <Link
                    href={`/admin/camps/${campSlug}/registrations/${reg.id}`}
                    className="block font-semibold text-ink hover:text-forest"
                  >
                    {reg.parentName ?? reg.parentEmail ?? "Unknown"}
                  </Link>
                  {reg.parentEmail ? (
                    <div className="text-xs text-ink-soft">{reg.parentEmail}</div>
                  ) : null}
                </td>
                <td className="px-3 py-3 align-top">
                  <Link
                    href={`/admin/camps/${campSlug}/registrations/${reg.id}`}
                    className="font-medium text-ink hover:text-forest hover:underline"
                  >
                    {camperLabel}
                  </Link>
                </td>
                <td className="px-3 py-3 text-right align-top font-mono text-ink">
                  {inv ? fmt(inv.amountDue) : "—"}
                </td>
                <td className="px-3 py-3 align-top">{methodBadge(row)}</td>
                <td className="px-3 py-3 align-top">
                  {inv?.referenceCode ? (
                    <code className="border border-line bg-paper-deep/60 px-1.5 py-0.5 text-[11px]">
                      {inv.referenceCode}
                    </code>
                  ) : (
                    <span className="text-ink-soft">—</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-xs text-ink-soft">
                  {new Date(reg.submittedAt).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric"
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
