import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Coins,
  EnvelopeSimple,
  Info,
  MapPin,
  Money,
  PaperPlaneTilt,
  ShieldCheck,
  Tent,
  Wallet,
  Warning,
  XCircle
} from "@phosphor-icons/react/ssr";

import { CopyButton } from "@/components/admin/copy-button";
import { PayPalButton } from "@/components/payment/paypal-button";
import {
  familyReferenceCodes,
  familyTotalRemaining,
  fetchFamilyBillingLines,
  formatFamilyMemo,
  type FamilyBillingLine
} from "@/lib/admin/family-billing";
import { findByReferenceCode } from "@/lib/admin/payment-links";
import { fetchPaymentsForInvoice } from "@/lib/admin/payments";
import { isPayPalConfigured, getPayPalEnvironment } from "@/lib/admin/paypal";
import type { Invoice, Payment, Registration } from "@/lib/types";
import { commitCashPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ ref: string }>;
type Search = Promise<{ status?: string }>;

function fmt(amount: number) {
  return amount.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function formatDateRange(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const monthShort = (d: Date) => d.toLocaleString("en-CA", { month: "short" });
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${monthShort(s)} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    }
    return `${monthShort(s)} ${s.getDate()} – ${monthShort(e)} ${e.getDate()}, ${e.getFullYear()}`;
  } catch {
    return `${start} → ${end}`;
  }
}

export default async function CampPayPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: Search;
}) {
  const { ref } = await params;
  const sp = searchParams ? await searchParams : ({} as Awaited<Search>);
  const statusFlash = sp.status ?? null;

  const lookup = await findByReferenceCode(ref);
  if (!lookup) notFound();

  const { camp, registration, invoice, paymentEmail } = lookup;
  const payments = await fetchPaymentsForInvoice(invoice.id);
  const remaining = Number((invoice.amountDue - invoice.amountPaid).toFixed(2));
  const familyLines = await fetchFamilyBillingLines(camp.id, registration.parentEmail, invoice.id);
  const isFamilyPayment = familyLines.length > 1;
  const familyRemaining = familyTotalRemaining(familyLines);
  const familyRefs = familyReferenceCodes(familyLines);
  const familyMemo = formatFamilyMemo(familyLines);
  const payRemaining = isFamilyPayment ? familyRemaining : remaining;

  const isPaid = invoice.status === "paid";
  const isCancelled = registration.status === "cancelled";
  const isPartial = invoice.status === "partial";
  const camperLabel = describeCampers(registration);

  return (
    <main className="min-h-dvh bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Link
          href="/camp"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
        >
          ← Back to camp
        </Link>

        {/* Header card */}
        <section className="mt-5 border border-line bg-paper-deep/40 p-6 md:p-8">
          <p className="eyebrow text-brass flex items-center gap-2">
            <Tent size={14} weight="duotone" /> Camp registration payment
          </p>
          <h1 className="headline-display mt-3 text-3xl md:text-4xl">{camp.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={14} weight="duotone" />
              {formatDateRange(camp.startDate, camp.endDate)}
            </span>
            {camp.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} weight="duotone" />
                {camp.location}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Registration for
              </p>
              <p className="mt-1 font-display text-2xl text-ink">{camperLabel}</p>
              {registration.parentName ? (
                <p className="text-sm text-ink-soft">
                  Parent: {registration.parentName}
                  {registration.parentEmail ? ` · ${registration.parentEmail}` : null}
                </p>
              ) : null}
            </div>
            <div className="border border-line bg-paper p-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Reference
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <code className="font-mono text-base text-ink">{invoice.referenceCode}</code>
                <CopyButton value={invoice.referenceCode} label="Copy" />
              </div>
            </div>
          </div>
        </section>

        {/* Flash banner from query string */}
        {statusFlash ? (
          <StatusBanner status={statusFlash} className="mt-5" />
        ) : null}

        {/* State-specific main content */}
        {isCancelled ? (
          <CancelledState contactEmail={paymentEmail} />
        ) : isPaid ? (
          <PaidState invoice={invoice} payments={payments} />
        ) : (
          <UnpaidState
            referenceCode={invoice.referenceCode}
            remaining={remaining}
            payRemaining={payRemaining}
            amountDue={invoice.amountDue}
            amountPaid={invoice.amountPaid}
            isPartial={isPartial}
            paymentEmail={paymentEmail}
            payments={payments}
            familyLines={familyLines}
            isFamilyPayment={isFamilyPayment}
            familyMemo={familyMemo}
            familyRefs={familyRefs}
          />
        )}

        <FooterHelp paymentEmail={paymentEmail} />
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// State sections
// ---------------------------------------------------------------------------

function PaidState({ invoice, payments }: { invoice: Invoice; payments: Payment[] }) {
  const latestPaid = payments.find((p) => p.status === "received");
  const methodLabel = latestPaid ? prettyMethod(latestPaid.method) : "—";
  return (
    <section className="mt-5 border-2 border-pine/40 bg-sky/40 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle size={28} weight="fill" className="mt-1 text-forest" />
        <div>
          <h2 className="font-display text-2xl text-ink">You're all set.</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We received <strong className="text-ink">{fmt(invoice.amountPaid)}</strong>
            {latestPaid ? <> via {methodLabel}</> : null}. Your spot is confirmed.
          </p>
          {latestPaid?.method === "cash" && latestPaid.cashReceived === false ? (
            <p className="mt-3 inline-flex items-center gap-1.5 border border-brass/40 bg-brass/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              <Money size={12} weight="duotone" />
              Bring exact cash to drop-off
            </p>
          ) : null}
          <p className="mt-4 text-xs text-ink-soft">
            A confirmation email is on the way to the address on file. Keep your reference
            code handy: <code className="font-mono text-ink">{invoice.referenceCode}</code>
          </p>
        </div>
      </div>
    </section>
  );
}

function CancelledState({ contactEmail }: { contactEmail: string | null }) {
  return (
    <section className="mt-5 border-2 border-ember/40 bg-ember/10 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <XCircle size={28} weight="duotone" className="mt-1 text-ember" />
        <div>
          <h2 className="font-display text-2xl text-ink">Registration cancelled</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This registration has been cancelled and is no longer accepting payments.
            {contactEmail ? (
              <>
                {" "}Contact{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-pine underline underline-offset-4"
                >
                  {contactEmail}
                </a>{" "}
                if you think this is a mistake.
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}

function UnpaidState({
  referenceCode,
  remaining,
  payRemaining,
  amountDue,
  amountPaid,
  isPartial,
  paymentEmail,
  payments,
  familyLines,
  isFamilyPayment,
  familyMemo,
  familyRefs
}: {
  referenceCode: string;
  remaining: number;
  payRemaining: number;
  amountDue: number;
  amountPaid: number;
  isPartial: boolean;
  paymentEmail: string | null;
  payments: Payment[];
  familyLines: FamilyBillingLine[];
  isFamilyPayment: boolean;
  familyMemo: string;
  familyRefs: string[];
}) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paypalEnabled = isPayPalConfigured() && Boolean(paypalClientId);

  return (
    <>
      {isFamilyPayment ? (
        <FamilyPaymentBanner lines={familyLines} familyRemaining={payRemaining} />
      ) : null}

      {/* Amount due */}
      <section className="mt-5 border border-line bg-paper p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {isFamilyPayment ? "Family total due" : "Amount due"}
            </p>
            <p className="mt-2 font-display text-5xl text-ink">{fmt(payRemaining)}</p>
            {isFamilyPayment ? (
              <p className="mt-2 text-xs text-ink-soft">
                This page ({referenceCode}): {fmt(remaining)} · Pay once below for all children
              </p>
            ) : isPartial ? (
              <p className="mt-2 text-xs text-ink-soft">
                {fmt(amountPaid)} of {fmt(amountDue)} received · {fmt(remaining)} remaining
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-soft">Total: {fmt(amountDue)}</p>
            )}
          </div>
          <div className="border border-line bg-paper-deep/40 p-4 text-xs text-ink-soft">
            <p className="font-semibold uppercase tracking-[0.14em] text-ink">Three ways to pay</p>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <Wallet size={12} weight="duotone" /> PayPal — instant
              </li>
              <li className="flex items-center gap-1.5">
                <PaperPlaneTilt size={12} weight="duotone" /> e-Transfer — overnight
              </li>
              <li className="flex items-center gap-1.5">
                <Money size={12} weight="duotone" /> Cash at drop-off
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PayPal */}
      <section className="mt-5 border border-line bg-paper p-6 md:p-8">
        <div className="flex items-start gap-3">
          <Wallet size={24} weight="duotone" className="mt-1 text-pine" />
          <div className="flex-1">
            <h3 className="font-display text-xl tracking-tight text-ink">Pay with PayPal</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {isFamilyPayment
                ? "One checkout covers every child listed above."
                : "Fastest option — confirmation is instant."}
            </p>
            <div className="mt-4">
              {paypalEnabled && paypalClientId ? (
                <PayPalButton
                  referenceCode={referenceCode}
                  clientId={paypalClientId}
                  amount={payRemaining}
                  environment={getPayPalEnvironment()}
                  familyRefs={isFamilyPayment ? familyRefs : undefined}
                />
              ) : (
                <div className="border border-dashed border-line bg-paper-deep/15 p-4 text-xs text-ink-soft">
                  PayPal isn&apos;t available right now. You can pay by e-Transfer or cash below.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* e-Transfer */}
      <section className="mt-5 border border-line bg-paper p-6 md:p-8">
        <div className="flex items-start gap-3">
          <PaperPlaneTilt size={24} weight="duotone" className="mt-1 text-pine" />
          <div className="flex-1">
            <h3 className="font-display text-xl tracking-tight text-ink">Pay by e-Transfer</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {isFamilyPayment
                ? "Send one e-Transfer for the full family total. Include every reference code in the message."
                : "Send an Interac e-Transfer and we'll match it automatically — usually within a few minutes."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3 [&>*]:min-w-0">
              <ETransferField
                label="Send to"
                value={paymentEmail ?? "Contact us for payment details"}
                canCopy={Boolean(paymentEmail)}
              />
              <ETransferField label="Amount" value={fmt(payRemaining)} />
              <ETransferField
                label="Message / memo"
                value={isFamilyPayment ? familyMemo : referenceCode}
                highlight
              />
            </div>
            <div className="mt-4 flex items-start gap-2 border-l-2 border-brass bg-brass/5 px-4 py-3 text-xs leading-relaxed text-ink-soft">
              <Info size={14} weight="duotone" className="mt-0.5 shrink-0 text-brass" />
              <p>
                {isFamilyPayment ? (
                  <>
                    Send <strong className="text-ink">{fmt(payRemaining)}</strong> once and put{" "}
                    <strong className="font-mono text-ink">{familyMemo}</strong> in the message so
                    we can mark every child paid.
                  </>
                ) : (
                  <>
                    You must include{" "}
                    <strong className="font-mono text-ink">{referenceCode}</strong> in the message
                    so we can match your payment to your registration. Without it, confirming your
                    spot may take longer.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cash */}
      <section className="mt-5 border border-line bg-paper p-6 md:p-8">
        <div className="flex items-start gap-3">
          <Money size={24} weight="duotone" className="mt-1 text-pine" />
          <div className="flex-1">
            <h3 className="font-display text-xl tracking-tight text-ink">Pay cash at drop-off</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {isFamilyPayment ? (
                <>
                  Bring <strong className="text-ink">{fmt(payRemaining)}</strong> in exact cash for
                  all children on drop-off day, or use PayPal / e-Transfer above for one combined
                  payment.
                </>
              ) : (
                <>
                  Bring <strong className="text-ink">{fmt(remaining)}</strong> in exact cash on
                  drop-off day. We&apos;ll mark you as paid right now and collect at camp.
                </>
              )}
            </p>
            {!isFamilyPayment ? (
              <form action={commitCashPaymentAction} className="mt-4">
                <input type="hidden" name="ref" value={referenceCode} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
                >
                  <Coins size={16} weight="bold" /> I&apos;ll bring cash to drop-off
                  <ArrowRight size={16} weight="bold" />
                </button>
              </form>
            ) : (
              <p className="mt-4 text-xs text-ink-soft">
                For multiple children, pay online once above or bring the full family total in cash
                on drop-off — tell staff all reference codes:{" "}
                <code className="font-mono text-ink">{familyMemo}</code>
              </p>
            )}
            {!isFamilyPayment ? (
              <p className="mt-3 text-xs text-ink-soft">
                By selecting cash you commit to paying at drop-off. If you change your mind, you
                can come back to this page and pay by PayPal or e-Transfer instead.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {payments.length > 0 ? (
        <section className="mt-5 border border-line bg-paper-deep/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Partial payments received
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {payments
              .filter((p) => p.status === "received")
              .map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span>
                    {fmt(p.amount)} via {prettyMethod(p.method)}
                    {p.method === "cash" && p.cashReceived === false ? (
                      <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                        (cash pending pickup)
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {new Date(p.receivedAt).toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Family payment (one form per child, one payment for the household)
// ---------------------------------------------------------------------------

function FamilyPaymentBanner({
  lines,
  familyRemaining
}: {
  lines: FamilyBillingLine[];
  familyRemaining: number;
}) {
  return (
    <section className="mt-5 border-2 border-pine/35 bg-sky/35 p-6 md:p-8">
      <p className="eyebrow text-forest">Family registration</p>
      <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
        One payment for all your children
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Each child has their own registration, but you can pay once for everyone. Use any
        child&apos;s payment page — the total is the same.
      </p>
      <ul className="mt-4 divide-y divide-line/60 border border-line bg-paper text-sm">
        {lines.map((line) => (
          <li
            key={line.invoiceId}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div>
              <p className="font-medium text-ink">
                {line.camperLabel}
                {line.isCurrent ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-pine">
                    this page
                  </span>
                ) : null}
              </p>
              <p className="font-mono text-xs text-ink-soft">{line.referenceCode}</p>
            </div>
            <p className="font-display text-lg text-ink">{fmt(line.remaining)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-sm text-ink-soft">
        Family total: <strong className="font-display text-xl text-ink">{fmt(familyRemaining)}</strong>
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Small bits
// ---------------------------------------------------------------------------

function StatusBanner({ status, className }: { status: string; className?: string }) {
  const map: Record<
    string,
    { tone: "ok" | "warn" | "info"; icon: React.ReactNode; label: string }
  > = {
    "cash-pledged": {
      tone: "ok",
      icon: <CheckCircle size={18} weight="fill" />,
      label: "Got it. Bring cash to drop-off — you're all set, and we'll collect payment at camp."
    },
    "already-paid": {
      tone: "info",
      icon: <Info size={18} weight="duotone" />,
      label: "This invoice is already paid in full."
    },
    cancelled: {
      tone: "warn",
      icon: <XCircle size={18} weight="duotone" />,
      label: "This registration was cancelled. Contact us if you think this is wrong."
    },
    error: {
      tone: "warn",
      icon: <Warning size={18} weight="duotone" />,
      label: "Something went wrong recording that. Try another method or contact us."
    }
  };
  const entry = map[status];
  if (!entry) return null;
  const tones = {
    ok: "border-pine/40 bg-sky/55 text-forest",
    warn: "border-ember/40 bg-ember/10 text-ember",
    info: "border-brass/40 bg-brass/15 text-ink"
  } as const;
  return (
    <div
      className={`flex items-center gap-2 border px-4 py-3 text-sm font-medium ${tones[entry.tone]} ${className ?? ""}`}
    >
      {entry.icon}
      <span>{entry.label}</span>
    </div>
  );
}

function ETransferField({
  label,
  value,
  highlight,
  canCopy
}: {
  label: string;
  value: string;
  highlight?: boolean;
  canCopy?: boolean;
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden border ${highlight ? "border-pine bg-sky/35" : "border-line bg-paper-deep/40"} p-3`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <span
          className={`min-w-0 flex-1 break-all font-mono text-sm leading-snug ${highlight ? "font-semibold text-ink" : "text-ink"}`}
        >
          {value}
        </span>
        {canCopy !== false ? (
          <CopyButton
            value={value}
            label="Copy"
            className="inline-flex h-7 shrink-0 items-center gap-1 self-start border border-line bg-paper px-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
          />
        ) : null}
      </div>
    </div>
  );
}

function FooterHelp({ paymentEmail }: { paymentEmail: string | null }) {
  return (
    <section className="mt-8 border-t border-line/60 pt-6 text-center text-xs text-ink-soft">
      <p className="inline-flex items-center gap-1.5">
        <ShieldCheck size={12} weight="duotone" />
        Payments are processed by PayPal and Interac — we never see your card or banking info.
      </p>
      {paymentEmail ? (
        <p className="mt-2 inline-flex items-center gap-1.5">
          <EnvelopeSimple size={12} weight="duotone" />
          Questions?{" "}
          <a
            href={`mailto:${paymentEmail}`}
            className="text-pine underline underline-offset-4 hover:text-forest"
          >
            {paymentEmail}
          </a>
        </p>
      ) : null}
    </section>
  );
}

function describeCampers(registration: Registration): string {
  if (registration.campers.length === 0) {
    return registration.parentName ?? registration.parentEmail ?? "Registration";
  }
  const names = registration.campers
    .map((c) => c.name)
    .filter(Boolean) as string[];
  if (names.length === 0) {
    return `${registration.campers.length} camper${registration.campers.length === 1 ? "" : "s"}`;
  }
  if (names.length <= 2) return names.join(" & ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function prettyMethod(method: string): string {
  if (method === "paypal") return "PayPal";
  if (method === "etransfer") return "e-Transfer";
  if (method === "cash") return "cash";
  if (method === "stripe") return "card";
  return method;
}
