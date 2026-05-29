import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  Coins,
  Money,
  PaperPlaneTilt,
  Trash,
  Warning,
  Wallet,
  XCircle
} from "@phosphor-icons/react/ssr";

import { headers } from "next/headers";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { CopyButton } from "@/components/admin/copy-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampBySlug } from "@/lib/admin/camps";
import { fetchRegistrationById } from "@/lib/admin/registrations";
import { fetchPaymentsForInvoice } from "@/lib/admin/payments";
import { buildPaymentUrl } from "@/lib/admin/payment-links";
import type { Invoice, Payment, PaymentMethod, Registration } from "@/lib/types";
import {
  cancelRegistrationAction,
  reactivateRegistrationAction,
  recomputeInvoiceAction,
  recordManualPaymentAction,
  sendReminderNowAction,
  sendRegistrationEmailAction,
  toggleCashReceivedAction,
  toggleRemindersPausedAction,
  updateRegistrationDetailsAction,
  voidPaymentAction
} from "../actions";
import { fetchRemindersForInvoice } from "@/lib/admin/reminder-log";
import type { ReminderLogRow } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; id: string }>;

function fmt(amount: number) {
  return amount.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export default async function AdminRegistrationDetailPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { slug, id } = await params;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const camp = await fetchCampBySlug(slug);
  if (!camp) notFound();

  const data = await fetchRegistrationById(id);
  if (!data || data.registration.campId !== camp.id) notFound();
  const { registration, invoice } = data;

  const payments = invoice ? await fetchPaymentsForInvoice(invoice.id) : [];
  const reminders = invoice ? await fetchRemindersForInvoice(invoice.id) : [];
  const remaining = invoice
    ? Number((invoice.amountDue - invoice.amountPaid).toFixed(2))
    : 0;

  // Build the public payment URL using the live request origin.
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "myo.camp";
  const proto =
    hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const paymentUrl = invoice ? buildPaymentUrl(invoice.referenceCode, `${proto}://${host}`) : null;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href={`/admin/camps/${slug}?tab=registrations`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> {camp.title} · Registrations
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs text-ink-soft">
              <CalendarBlank size={14} weight="duotone" />
              <span>Submitted {fmtDateTime(registration.submittedAt)}</span>
              <span>· {sourceLabel(registration.source)}</span>
            </p>
            <h1 className="headline-display mt-2 text-3xl">
              {registration.parentName ?? registration.parentEmail ?? "Unknown family"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill registration={registration} invoice={invoice} />
              {invoice ? (
                <span className="inline-flex h-7 items-center gap-1 border border-line bg-paper px-2.5 text-[10px] font-mono uppercase tracking-[0.16em] text-ink-soft">
                  REF {invoice.referenceCode}
                </span>
              ) : null}
            </div>
          </div>
          <CancelActions slug={slug} registration={registration} />
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column: registration details */}
        <div className="space-y-6">
          <InvoiceSummary invoice={invoice} remaining={remaining} />

          <RecordPaymentCard
            slug={slug}
            registrationId={registration.id}
            invoice={invoice}
            remaining={remaining}
            disabled={registration.status === "cancelled" || !invoice}
          />

          <PaymentsList
            slug={slug}
            registrationId={registration.id}
            payments={payments}
          />

          <DetailsForm slug={slug} registration={registration} />

          <CampersCard registration={registration} />
        </div>

        {/* Right column: invoice tools */}
        <aside className="space-y-6">
          {paymentUrl && invoice ? (
            <PaymentLinkCard
              url={paymentUrl}
              slug={slug}
              registrationId={registration.id}
              invoiceId={invoice.id}
              referenceCode={invoice.referenceCode}
              parentEmail={registration.parentEmail}
            />
          ) : null}
          <RemindersCard
            slug={slug}
            registrationId={registration.id}
            invoice={invoice}
            reminders={reminders}
            parentEmail={registration.parentEmail}
          />
          <InvoiceToolsCard
            slug={slug}
            registrationId={registration.id}
            invoice={invoice}
            remaining={remaining}
          />
        </aside>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------

function StatusPill({
  registration,
  invoice
}: {
  registration: Registration;
  invoice: Invoice | null;
}) {
  if (registration.status === "cancelled") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 border border-line bg-paper-deep/60 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        <XCircle size={12} weight="duotone" /> Cancelled
      </span>
    );
  }
  if (!invoice) {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 border border-brass/40 bg-brass/15 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
        <Warning size={12} weight="duotone" /> No invoice
      </span>
    );
  }
  if (invoice.status === "paid") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 border border-pine/40 bg-sky/55 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
        <CheckCircle size={12} weight="fill" /> Paid · {fmt(invoice.amountPaid)}
      </span>
    );
  }
  if (invoice.status === "partial") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 border border-brass/40 bg-brass/15 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
        <Coins size={12} weight="duotone" /> Partial · {fmt(invoice.amountPaid)} / {fmt(invoice.amountDue)}
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 items-center gap-1.5 border border-line bg-paper px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
      Unpaid · {fmt(invoice.amountDue)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Cancel / reactivate
// ---------------------------------------------------------------------------

function CancelActions({ slug, registration }: { slug: string; registration: Registration }) {
  if (registration.status === "cancelled") {
    return (
      <form action={reactivateRegistrationAction} className="flex items-center gap-2">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={registration.id} />
        <AdminSubmitButton
          idleLabel="Reactivate"
          variant="secondary"
          icon={<CheckCircle size={14} weight="bold" />}
        />
      </form>
    );
  }
  return (
    <details className="group">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 border border-ember/40 bg-ember/10 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ember transition hover:bg-ember/20 [&::-webkit-details-marker]:hidden">
        <XCircle size={12} weight="bold" /> Cancel
      </summary>
      <div className="mt-2 w-[min(94vw,360px)] border border-line bg-paper p-4">
        <form action={cancelRegistrationAction} className="space-y-3">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={registration.id} />
          <AdminField label="Reason (optional)">
            <input
              name="reason"
              placeholder="Family withdrew, scheduling conflict, …"
              className={adminInputClass}
            />
          </AdminField>
          <p className="text-xs leading-relaxed text-ink-soft">
            Cancelling hides the family from active counts and frees their spot if you have a
            capacity set. Payments are not refunded automatically.
          </p>
          <AdminSubmitButton idleLabel="Confirm cancel" variant="danger" />
        </form>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Invoice summary
// ---------------------------------------------------------------------------

function InvoiceSummary({ invoice, remaining }: { invoice: Invoice | null; remaining: number }) {
  if (!invoice) {
    return (
      <div className="border border-dashed border-brass/40 bg-brass/10 p-5 text-sm text-ink">
        This registration has no invoice yet. Use{" "}
        <strong>Recalculate balance</strong> in the sidebar, or contact support if this looks wrong.
      </div>
    );
  }
  return (
    <div className="border border-line bg-paper p-5">
      <p className="eyebrow text-brass">Invoice</p>
      <div className="mt-2 grid gap-4 md:grid-cols-3">
        <Stat label="Amount due" value={fmt(invoice.amountDue)} />
        <Stat label="Collected" value={fmt(invoice.amountPaid)} tone="ok" />
        <Stat
          label="Remaining"
          value={fmt(Math.max(0, remaining))}
          tone={remaining <= 0 ? "ok" : "warn"}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
        <span>Ref</span>
        <code className="border border-line bg-paper-deep/60 px-2 py-0.5 font-mono text-[11px] text-ink">
          {invoice.referenceCode}
        </code>
        <CopyButton value={invoice.referenceCode} />
        <span className="ml-auto">Updated {fmtDateTime(invoice.updatedAt)}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const toneClass =
    tone === "ok" ? "text-forest" : tone === "warn" ? "text-ember" : "text-ink";
  return (
    <div className="border border-line bg-paper-deep/35 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className={`mt-2 font-display text-2xl tracking-tight ${toneClass}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Record a manual payment
// ---------------------------------------------------------------------------

function RecordPaymentCard({
  slug,
  registrationId,
  invoice,
  remaining,
  disabled
}: {
  slug: string;
  registrationId: string;
  invoice: Invoice | null;
  remaining: number;
  disabled: boolean;
}) {
  if (disabled) return null;

  const methods: Array<{ key: PaymentMethod; label: string; icon: React.ReactNode }> = [
    { key: "cash", label: "Cash", icon: <Money size={12} weight="bold" /> },
    { key: "etransfer", label: "e-Transfer", icon: <PaperPlaneTilt size={12} weight="bold" /> },
    { key: "paypal", label: "PayPal", icon: <Wallet size={12} weight="bold" /> },
    { key: "manual", label: "Other", icon: <Coins size={12} weight="bold" /> }
  ];

  return (
    <div className="border border-line bg-paper p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow text-brass">Record payment</p>
          <h3 className="mt-2 font-display text-xl tracking-tight text-ink">Mark as paid</h3>
        </div>
        <p className="text-xs text-ink-soft">
          Remaining: <strong className="text-ink">{fmt(Math.max(0, remaining))}</strong>
        </p>
      </div>

      <form action={recordManualPaymentAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="registrationId" value={registrationId} />

        <AdminField label="Method" className="md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {methods.map((m, i) => (
              <label
                key={m.key}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition has-checked:border-pine has-checked:bg-forest has-checked:text-paper hover:border-pine hover:text-ink"
              >
                <input
                  type="radio"
                  name="method"
                  value={m.key}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {m.icon}
                {m.label}
              </label>
            ))}
          </div>
        </AdminField>

        <AdminField label="Amount" hint={`Leave blank to record ${fmt(Math.max(0, remaining))}`}>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder={String(Math.max(0, remaining))}
            className={adminInputClass}
          />
        </AdminField>

        <AdminField label="External reference">
          <input
            name="externalRef"
            placeholder="PayPal txn ID, cheque #, e-transfer confirm code"
            className={adminInputClass}
          />
        </AdminField>

        <AdminField label="Sender name">
          <input name="senderName" className={adminInputClass} />
        </AdminField>

        <AdminField label="Sender email">
          <input name="senderEmail" type="email" className={adminInputClass} />
        </AdminField>

        <AdminField label="Memo / notes" className="md:col-span-2">
          <textarea name="senderMemo" rows={2} className={adminTextareaClass} />
        </AdminField>

        <label className="inline-flex items-center gap-2 text-xs text-ink-soft md:col-span-2">
          <input type="checkbox" name="cashReceived" className="h-4 w-4 accent-pine" />
          Mark cash as collected (for cash payments — leave unchecked if owner still needs to
          pick it up)
        </label>

        <div className="md:col-span-2">
          <AdminSubmitButton
            idleLabel="Record payment"
            pendingLabel="Recording…"
            icon={<CheckCircle size={14} weight="bold" />}
          />
        </div>
      </form>
      {!invoice ? (
        <p className="mt-3 text-xs text-ember">
          No invoice yet. Use <strong>Recalculate balance</strong> in the sidebar first.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payments list
// ---------------------------------------------------------------------------

function PaymentsList({
  slug,
  registrationId,
  payments
}: {
  slug: string;
  registrationId: string;
  payments: Payment[];
}) {
  if (payments.length === 0) {
    return (
      <div className="border border-dashed border-line bg-paper-deep/15 p-5 text-sm text-ink-soft">
        No payments recorded yet.
      </div>
    );
  }
  return (
    <div className="border border-line bg-paper">
      <div className="border-b border-line bg-paper-deep/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        Payment history
      </div>
      <ul className="divide-y divide-line/60">
        {payments.map((p) => (
          <li key={p.id} className="grid gap-2 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
                <span className="font-semibold">{fmt(p.amount)}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  {p.method}
                </span>
                {p.status !== "received" ? (
                  <span className="inline-flex h-5 items-center border border-ember/40 bg-ember/10 px-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ember">
                    {p.status}
                  </span>
                ) : null}
                {p.method === "cash" && p.cashReceived === false ? (
                  <span className="inline-flex h-5 items-center border border-brass/40 bg-brass/15 px-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
                    Awaiting pickup
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-ink-soft">
                {fmtDateTime(p.receivedAt)}
                {p.senderName ? <> · from {p.senderName}</> : null}
                {p.externalRef ? <> · ref {p.externalRef}</> : null}
              </div>
              {p.senderMemo ? (
                <div className="mt-1 text-xs italic text-ink-soft">"{p.senderMemo}"</div>
              ) : null}
            </div>
            <div className="flex items-center gap-2 md:justify-end">
              {p.method === "cash" && p.status === "received" ? (
                <form action={toggleCashReceivedAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="registrationId" value={registrationId} />
                  <input type="hidden" name="paymentId" value={p.id} />
                  <input
                    type="hidden"
                    name="received"
                    value={p.cashReceived ? "false" : "true"}
                  />
                  <AdminSubmitButton
                    idleLabel={p.cashReceived ? "Mark not collected" : "Mark collected"}
                    variant="secondary"
                  />
                </form>
              ) : null}
              {p.status === "received" ? (
                <form action={voidPaymentAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="registrationId" value={registrationId} />
                  <input type="hidden" name="paymentId" value={p.id} />
                  <AdminSubmitButton
                    idleLabel="Void"
                    variant="danger"
                    icon={<Trash size={12} weight="bold" />}
                  />
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit contact + notes
// ---------------------------------------------------------------------------

function DetailsForm({ slug, registration }: { slug: string; registration: Registration }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="eyebrow text-brass">Contact</p>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink">Parent details</h3>
      <form action={updateRegistrationDetailsAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={registration.id} />
        <AdminField label="Parent name">
          <input
            name="parentName"
            defaultValue={registration.parentName ?? ""}
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Parent email">
          <input
            name="parentEmail"
            type="email"
            defaultValue={registration.parentEmail ?? ""}
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Parent phone" className="md:col-span-2">
          <input
            name="parentPhone"
            defaultValue={registration.parentPhone ?? ""}
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Internal notes" className="md:col-span-2">
          <textarea
            name="notes"
            rows={3}
            defaultValue={registration.notes ?? ""}
            className={adminTextareaClass}
          />
        </AdminField>
        <div className="md:col-span-2">
          <AdminSubmitButton idleLabel="Save changes" pendingLabel="Saving…" variant="secondary" />
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campers
// ---------------------------------------------------------------------------

function CampersCard({ registration }: { registration: Registration }) {
  if (registration.campers.length === 0) {
    return (
      <div className="border border-dashed border-line bg-paper-deep/15 p-5 text-sm text-ink-soft">
        No camper details on file. Update the registration above or check the submission in JotForm.
      </div>
    );
  }
  return (
    <div className="border border-line bg-paper p-5">
      <p className="eyebrow text-brass">Campers</p>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {registration.campers.map((c, idx) => (
          <li key={idx} className="border border-line bg-paper-deep/35 p-3 text-sm text-ink">
            <p className="font-semibold">{c.name ?? `Camper ${idx + 1}`}</p>
            {c.age != null ? <p className="text-xs text-ink-soft">Age {c.age}</p> : null}
            {c.allergies ? <p className="mt-1 text-xs text-ink-soft">Allergies: {c.allergies}</p> : null}
            {c.medical ? <p className="text-xs text-ink-soft">Medical: {c.medical}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function sourceLabel(source: Registration["source"]): string {
  switch (source) {
    case "jotform":
      return "Online form";
    case "manual":
      return "Added manually";
    case "waitlist_claim":
      return "Waitlist claim";
    default:
      return "Registration";
  }
}

// ---------------------------------------------------------------------------
// Sidebar: payment link
// ---------------------------------------------------------------------------

function PaymentLinkCard({
  url,
  slug,
  registrationId,
  invoiceId,
  referenceCode,
  parentEmail
}: {
  url: string;
  slug: string;
  registrationId: string;
  invoiceId: string;
  referenceCode: string;
  parentEmail: string | null;
}) {
  return (
    <div className="border border-pine/40 bg-sky/35 p-5">
      <p className="eyebrow text-forest">Parent payment link</p>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink">
        Send to the family
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Reference <span className="font-mono text-ink">{referenceCode}</span> — parents need this
        for e-Transfer and the payment page. Email it with the link below, or copy both manually.
      </p>
      <div className="mt-3 break-all border border-line bg-paper p-3 font-mono text-xs text-ink">
        {url}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton
          value={url}
          label="Copy link"
          className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
        />
        <CopyButton
          value={referenceCode}
          label="Copy ref"
          className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
        >
          Open
        </a>
        {parentEmail ? (
          <form action={sendRegistrationEmailAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="registrationId" value={registrationId} />
            <input type="hidden" name="invoiceId" value={invoiceId} />
            <AdminSubmitButton
              idleLabel="Send confirmation email"
              pendingLabel="Sending…"
              icon={<PaperPlaneTilt size={12} weight="bold" />}
            />
          </form>
        ) : null}
      </div>
      {!parentEmail ? (
        <p className="mt-3 text-xs text-brass">
          No parent email on file — add one above to send the confirmation automatically.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar: reminders (send now + pause/resume + history)
// ---------------------------------------------------------------------------

function RemindersCard({
  slug,
  registrationId,
  invoice,
  reminders,
  parentEmail
}: {
  slug: string;
  registrationId: string;
  invoice: Invoice | null;
  reminders: ReminderLogRow[];
  parentEmail: string | null;
}) {
  if (!invoice) return null;

  const recent = reminders.slice(0, 5);
  const paused = invoice.autoRemindersPaused;
  const alreadyPaid = invoice.status === "paid";

  return (
    <div className="border border-line bg-paper p-5">
      <p className="eyebrow text-brass">Reminders</p>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink">
        Email this family
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Auto reminders go out at T-7 / T-3 / T-1 days before camp.{" "}
        {alreadyPaid
          ? "This invoice is paid — no further reminders will fire."
          : paused
            ? "Auto reminders are currently paused for this invoice."
            : "Auto reminders are active for this invoice."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!alreadyPaid ? (
          <form action={sendReminderNowAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="registrationId" value={registrationId} />
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <AdminSubmitButton
              idleLabel="Send reminder now"
              pendingLabel="Sending…"
              icon={<PaperPlaneTilt size={12} weight="bold" />}
            />
          </form>
        ) : null}
        {!alreadyPaid ? (
          <form action={toggleRemindersPausedAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="registrationId" value={registrationId} />
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input type="hidden" name="paused" value={paused ? "false" : "true"} />
            <AdminSubmitButton
              idleLabel={paused ? "Resume auto reminders" : "Pause auto reminders"}
              variant="secondary"
            />
          </form>
        ) : null}
      </div>

      {!parentEmail ? (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-ember">
          <Warning size={12} weight="bold" /> No parent email on file — sending will fail. Add one above.
        </p>
      ) : null}

      <div className="mt-5 border-t border-line/60 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
          History
        </p>
        {recent.length === 0 ? (
          <p className="mt-2 text-xs text-ink-soft">No reminders sent yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {recent.map((r) => (
              <li
                key={r.id}
                className="border border-line bg-paper-deep/35 px-3 py-2 text-xs text-ink"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-ink-soft">
                    {r.reminderNumber}
                  </span>
                  <ReminderStatusPill status={r.status} />
                  <span className="ml-auto text-[10px] text-ink-soft">
                    {fmtDateTime(r.sentAt)}
                  </span>
                </div>
                {r.subject ? (
                  <p className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{r.subject}</p>
                ) : null}
                {r.errorMessage ? (
                  <p className="mt-1 text-[11px] text-ember">{r.errorMessage}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReminderStatusPill({ status }: { status: ReminderLogRow["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "Sent", cls: "border-pine/40 bg-sky/40 text-forest" },
    delivered: { label: "Delivered", cls: "border-pine/40 bg-sky/40 text-forest" },
    failed: { label: "Failed", cls: "border-ember/40 bg-ember/10 text-ember" },
    bounced: { label: "Bounced", cls: "border-ember/40 bg-ember/10 text-ember" },
    opened: { label: "Opened", cls: "border-pine/40 bg-sky/40 text-forest" },
    clicked: { label: "Clicked", cls: "border-pine/40 bg-sky/40 text-forest" }
  };
  const meta = map[status] ?? { label: status, cls: "border-line bg-paper text-ink-soft" };
  return (
    <span
      className={`inline-flex h-5 items-center border px-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sidebar: invoice tools
// ---------------------------------------------------------------------------

function InvoiceToolsCard({
  slug,
  registrationId,
  invoice,
  remaining
}: {
  slug: string;
  registrationId: string;
  invoice: Invoice | null;
  remaining: number;
}) {
  return (
    <div className="border border-line bg-paper-deep/35 p-5">
      <p className="eyebrow text-brass">Invoice tools</p>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink">Quick actions</h3>
      <div className="mt-4 space-y-3 text-sm text-ink">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Reference code</p>
          <p className="mt-1 font-mono text-base">{invoice?.referenceCode ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Status</p>
          <p className="mt-1 capitalize">{invoice?.status ?? "no invoice"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Remaining</p>
          <p className="mt-1 font-display text-lg">{invoice ? fmt(Math.max(0, remaining)) : "—"}</p>
        </div>
        {invoice ? (
          <form action={recomputeInvoiceAction} className="pt-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="registrationId" value={registrationId} />
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <AdminSubmitButton
              idleLabel="Recalculate balance"
              variant="secondary"
              className="w-full"
            />
          </form>
        ) : null}
        <p className="border-t border-line/60 pt-3 text-xs leading-relaxed text-ink-soft">
          Send the payment link from the card above. Automatic reminder emails run before camp if
          email is configured in Setup.
        </p>
      </div>
    </div>
  );
}

