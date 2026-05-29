import Link from "next/link";
import {
  ArrowSquareOut,
  CheckCircle,
  EnvelopeSimple,
  Info,
  Money,
  PaperPlaneTilt,
  Question,
  Warning,
  XCircle
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import {
  resolveAdminFlashState,
  type AdminSearchParams
} from "@/lib/admin/page-state";
import { fetchGmailCredentials } from "@/lib/admin/gmail";
import { fetchInboundEmails } from "@/lib/admin/inbound-emails";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { InboundEmail, InboundEmailMatchStatus } from "@/lib/types";
import { matchInboundEmailAction, dismissUnrelatedInboundAction, markNotPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "unmatched", label: "Needs match" },
  { key: "error", label: "Errors" },
  { key: "matched", label: "Auto-matched" },
  { key: "all", label: "All" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

function pickTab(value: string | undefined): TabKey {
  if (value === "error" || value === "matched" || value === "all") return value;
  return "unmatched";
}

function statusesForTab(tab: TabKey): InboundEmailMatchStatus[] | undefined {
  if (tab === "unmatched") return ["unmatched", "pending"];
  if (tab === "error") return ["error"];
  if (tab === "matched") return ["matched"];
  return undefined; // all
}

interface InvoiceCandidate {
  id: string;
  referenceCode: string;
  parentName: string | null;
  campTitle: string;
  amountDue: number;
  amountPaid: number;
}

async function fetchOpenInvoices(limit = 200): Promise<InvoiceCandidate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, reference_code, amount_due, amount_paid, status, registrations ( parent_name, camps ( title ) )"
    )
    .in("status", ["pending", "partial"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  type Row = {
    id: string;
    reference_code: string;
    amount_due: number | string;
    amount_paid: number | string;
    status: string;
    registrations:
      | { parent_name: string | null; camps: { title: string } | { title: string }[] | null }
      | Array<{
          parent_name: string | null;
          camps: { title: string } | { title: string }[] | null;
        }>
      | null;
  };

  return (data as unknown as Row[]).map((row) => {
    // Supabase typing surfaces nested joins as arrays; both shapes are valid at runtime.
    const reg = Array.isArray(row.registrations) ? row.registrations[0] : row.registrations;
    const campJoin = reg?.camps;
    const camp = Array.isArray(campJoin) ? campJoin[0] : campJoin;
    return {
      id: row.id,
      referenceCode: row.reference_code,
      parentName: reg?.parent_name ?? null,
      campTitle: camp?.title ?? "—",
      amountDue: Number(row.amount_due),
      amountPaid: Number(row.amount_paid)
    };
  });
}

function fmt(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string | null) {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(iso).toLocaleDateString("en-CA");
}

export default async function AdminInboxPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const sp = (searchParams ? await searchParams : {}) as { tab?: string };
  const tab = pickTab(sp.tab);

  const [creds, emails, invoices] = await Promise.all([
    fetchGmailCredentials(),
    fetchInboundEmails({ statuses: statusesForTab(tab), limit: 100 }),
    fetchOpenInvoices(200)
  ]);

  const counts = {
    unmatched: 0,
    matched: 0,
    error: 0,
    all: 0
  };
  // Cheap recount (single query) so the badges aren't tied to the active filter.
  const allEmails = await fetchInboundEmails({ limit: 500 });
  for (const e of allEmails) {
    counts.all += 1;
    if (e.matchStatus === "unmatched" || e.matchStatus === "pending") counts.unmatched += 1;
    else if (e.matchStatus === "matched") counts.matched += 1;
    else if (e.matchStatus === "error") counts.error += 1;
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <p className="eyebrow text-brass flex items-center gap-2">
          <EnvelopeSimple size={14} weight="duotone" /> Inbox · e-Transfer triage
        </p>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">Inbox</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Camp e-Transfers with a <strong className="text-ink">MYO-2026-XXXX</strong> reference in
          the memo auto-match. Only transfers missing a reference but matching a parent email +
          invoice amount appear here. Personal transfers are ignored automatically.
        </p>
        {creds ? (
          <p className="mt-2 text-xs text-ink-soft">
            Connected: <span className="font-mono">{creds.email}</span> · last polled{" "}
            <strong className="text-ink">{timeAgo(creds.lastPolledAt)}</strong>
            {creds.lastPolledStatus === "error" ? (
              <span className="ml-2 inline-flex items-center gap-1 text-ember">
                <Warning size={12} weight="duotone" />
                Last poll errored
              </span>
            ) : null}
          </p>
        ) : (
          <div className="mt-4 border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
            Gmail isn't connected.{" "}
            <Link href="/admin/setup/gmail" className="underline underline-offset-4">
              Connect it now
            </Link>{" "}
            to start auto-matching e-transfers.
          </div>
        )}
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-line pb-px">
        {tabs.map((t) => {
          const active = t.key === tab;
          const count = counts[t.key];
          return (
            <Link
              key={t.key}
              href={`/admin/inbox?tab=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex items-center gap-2 border border-b-0 border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink"
                  : "inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
              }
            >
              {t.label}
              <span
                className={
                  active
                    ? "rounded-sm bg-paper-deep/60 px-1.5 text-[10px]"
                    : "rounded-sm bg-paper-deep/40 px-1.5 text-[10px]"
                }
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {tab === "unmatched" && counts.unmatched > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 border border-line bg-paper-deep/35 px-4 py-3 text-sm text-ink-soft">
          <span>
            Seeing personal e-Transfers? Clear items with no camp reference from this list.
          </span>
          <form action={dismissUnrelatedInboundAction}>
            <AdminSubmitButton idleLabel="Clear unrelated" variant="secondary" />
          </form>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {emails.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          emails.map((email) => (
            <EmailCard key={email.id} email={email} invoices={invoices} />
          ))
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function EmptyState({ tab }: { tab: TabKey }) {
  const copy: Record<TabKey, { icon: React.ReactNode; title: string; body: string }> = {
    unmatched: {
      icon: <CheckCircle size={28} weight="duotone" className="text-pine" />,
      title: "Nothing waiting",
      body: "All polled e-transfers were either auto-matched or aren't payments."
    },
    error: {
      icon: <CheckCircle size={28} weight="duotone" className="text-pine" />,
      title: "No errors",
      body: "Every reference code was found and recorded cleanly."
    },
    matched: {
      icon: <Info size={28} weight="duotone" className="text-pine" />,
      title: "No auto-matches yet",
      body: "Once parents send e-Transfers with the right reference code, they'll show up here."
    },
    all: {
      icon: <Info size={28} weight="duotone" className="text-pine" />,
      title: "No emails polled yet",
      body: "Click 'Poll now' in /admin/setup/gmail to test."
    }
  };
  const c = copy[tab];
  return (
    <div className="border border-dashed border-line bg-paper-deep/15 p-10 text-center">
      <div className="mx-auto">{c.icon}</div>
      <p className="mt-4 font-display text-xl tracking-tight text-ink">{c.title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{c.body}</p>
    </div>
  );
}

function statusBadge(status: InboundEmailMatchStatus) {
  const map: Record<
    InboundEmailMatchStatus,
    { tone: "ok" | "warn" | "muted"; label: string; icon: React.ReactNode }
  > = {
    matched: {
      tone: "ok",
      label: "Matched",
      icon: <CheckCircle size={11} weight="fill" />
    },
    unmatched: {
      tone: "warn",
      label: "Needs match",
      icon: <Question size={11} weight="bold" />
    },
    pending: {
      tone: "warn",
      label: "Pending",
      icon: <Question size={11} weight="bold" />
    },
    error: {
      tone: "warn",
      label: "Error",
      icon: <Warning size={11} weight="bold" />
    },
    duplicate: {
      tone: "muted",
      label: "Duplicate",
      icon: <Info size={11} weight="bold" />
    },
    not_payment: {
      tone: "muted",
      label: "Not a payment",
      icon: <XCircle size={11} weight="bold" />
    }
  };
  const entry = map[status];
  const tones = {
    ok: "border-pine/40 bg-sky/55 text-forest",
    warn: "border-brass/40 bg-brass/15 text-ink",
    muted: "border-line bg-paper-deep/60 text-ink-soft"
  } as const;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 border px-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones[entry.tone]}`}
    >
      {entry.icon}
      {entry.label}
    </span>
  );
}

function EmailCard({
  email,
  invoices
}: {
  email: InboundEmail;
  invoices: InvoiceCandidate[];
}) {
  const canMatchManually =
    email.matchStatus === "unmatched" ||
    email.matchStatus === "pending" ||
    email.matchStatus === "error";

  return (
    <article className="border border-line bg-paper">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line/60 bg-paper-deep/30 px-5 py-3">
        <div className="min-w-0">
          <p className="font-display text-base tracking-tight text-ink">
            {email.subject ?? "(no subject)"}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            From {email.fromAddress ?? "unknown"} · received {fmtDateTime(email.receivedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">{statusBadge(email.matchStatus)}</div>
      </header>

      <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
        <Field label="Sender" icon={<EnvelopeSimple size={11} weight="duotone" />}>
          {email.parsedSenderName ?? "—"}
        </Field>
        <Field label="Amount" icon={<Money size={11} weight="duotone" />}>
          {email.parsedAmount != null ? fmt(email.parsedAmount) : "—"}
        </Field>
        <Field label="Reference (from memo)" icon={<PaperPlaneTilt size={11} weight="duotone" />}>
          {email.parsedReferenceCode ? (
            <code className="border border-line bg-paper-deep/60 px-1.5 py-0.5 text-[11px]">
              {email.parsedReferenceCode}
            </code>
          ) : (
            <span className="text-ink-soft">none</span>
          )}
        </Field>
        {email.parsedMemo ? (
          <div className="md:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Memo
            </p>
            <p className="mt-1 text-sm italic text-ink">"{email.parsedMemo}"</p>
          </div>
        ) : null}
        {email.errorMessage ? (
          <div className="md:col-span-3 border border-ember/40 bg-ember/10 p-3 text-xs text-ember">
            <strong>Note:</strong> {email.errorMessage}
          </div>
        ) : null}
      </div>

      {canMatchManually ? (
        <footer className="border-t border-line/60 bg-paper-deep/15 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Match to invoice
          </p>
          <form
            action={matchInboundEmailAction}
            className="mt-2 flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="inboundId" value={email.id} />
            <label className="flex-1 min-w-[260px]">
              <select
                name="referenceCode"
                required
                defaultValue={
                  invoices.find((i) => i.referenceCode === email.parsedReferenceCode)
                    ? email.parsedReferenceCode ?? ""
                    : ""
                }
                className="h-11 w-full border border-line bg-paper px-3 text-sm text-ink"
              >
                <option value="">Choose an invoice…</option>
                {invoices.map((inv) => {
                  const remaining = inv.amountDue - inv.amountPaid;
                  const label =
                    `${inv.referenceCode} · ${inv.parentName ?? "Unknown"} · ${inv.campTitle} · ` +
                    `${fmt(remaining)} owed`;
                  return (
                    <option key={inv.id} value={inv.referenceCode}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <AdminSubmitButton idleLabel="Match" icon={<CheckCircle size={14} weight="bold" />} />
          </form>
          <form action={markNotPaymentAction} className="mt-3">
            <input type="hidden" name="inboundId" value={email.id} />
            <AdminSubmitButton
              idleLabel="Not a payment"
              variant="ghost"
              icon={<XCircle size={12} weight="bold" />}
            />
          </form>
        </footer>
      ) : email.matchStatus === "matched" && email.matchedPaymentId ? (
        <footer className="border-t border-line/60 bg-paper-deep/15 px-5 py-3 text-xs text-ink-soft">
          <Link
            href={`/admin/camps`}
            className="inline-flex items-center gap-1.5 text-pine underline underline-offset-4"
          >
            View matched payment <ArrowSquareOut size={11} weight="bold" />
          </Link>
        </footer>
      ) : null}
    </article>
  );
}

function Field({
  label,
  icon,
  children
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{children}</p>
    </div>
  );
}
