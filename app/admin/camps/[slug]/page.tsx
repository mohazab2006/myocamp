import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  PencilSimple,
  Plus
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import {
  REGISTRATION_FILTERS,
  RegistrationsTable,
  filterRegistrations,
  type FilterKey,
  type RegistrationRowData
} from "@/components/admin/registrations-table";
import { WaitlistTable } from "@/components/admin/waitlist-table";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampBySlug, fetchCampStats } from "@/lib/admin/camps";
import { fetchRegistrationsForCamp } from "@/lib/admin/registrations";
import { fetchPaymentsForInvoice } from "@/lib/admin/payments";
import { buildClaimUrl, fetchWaitlistForCamp } from "@/lib/admin/waitlist";
import { jotformThankYouRedirectUrl } from "@/lib/content/camps-public";
import { SITE_URL } from "@/lib/site";
import type { Camp, WaitlistEntry } from "@/lib/types";
import { createManualRegistrationAction } from "./registrations/actions";
import { createManualWaitlistAction, expireOverdueClaimsAction } from "./waitlist/actions";
import { reopenCampAction } from "@/app/admin/camps/actions";

export const dynamic = "force-dynamic";

type AdminCampDetailParams = Promise<{ slug: string }>;
type AdminCampDetailSearch = Promise<{
  tab?: string;
  filter?: string;
  message?: string;
  type?: string;
}>;

const statusStyle: Record<Camp["status"], string> = {
  open: "border-pine/40 bg-sky/55 text-forest",
  full: "border-brass/40 bg-brass/15 text-ink",
  draft: "border-line bg-paper-deep/60 text-ink-soft",
  closed: "border-line bg-paper-deep/60 text-ink-soft",
  archived: "border-line bg-paper-deep/30 text-ink-soft"
};

const tabs = [
  { key: "registrations", label: "Registrations" },
  { key: "waitlist", label: "Waitlist" },
  { key: "settings", label: "Settings" }
] as const;
type TabKey = (typeof tabs)[number]["key"];

function pickTab(value: string | undefined): TabKey {
  if (value === "waitlist" || value === "settings") return value;
  return "registrations";
}

function pickFilter(value: string | undefined): FilterKey {
  const allowed = REGISTRATION_FILTERS.map((f) => f.key);
  return (allowed as string[]).includes(value ?? "") ? (value as FilterKey) : "all";
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

export default async function AdminCampDetailPage({
  params,
  searchParams
}: {
  params: AdminCampDetailParams;
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { slug } = await params;
  const sp = (searchParams ? ((await searchParams) as Awaited<AdminCampDetailSearch>) : {}) as Awaited<
    AdminCampDetailSearch
  >;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const camp = await fetchCampBySlug(slug);
  if (!camp) notFound();

  const stats = (await fetchCampStats([camp.id]))[camp.id];
  const tab = pickTab(sp.tab);

  // Load registrations + their latest payment row only on the tabs that need them.
  let registrationRows: RegistrationRowData[] = [];
  if (tab === "registrations") {
    const raw = await fetchRegistrationsForCamp(camp.id);
    registrationRows = await Promise.all(
      raw.map(async ({ registration, invoice }) => {
        let topPayment = null;
        if (invoice) {
          const payments = await fetchPaymentsForInvoice(invoice.id);
          topPayment = payments[0] ?? null;
        }
        return { registration, invoice, topPayment };
      })
    );
  }

  let waitlistEntries: WaitlistEntry[] = [];
  const siteOrigin = SITE_URL;

  if (tab === "waitlist") {
    waitlistEntries = await fetchWaitlistForCamp(camp.id, { openOnly: true });
  }

  const filter = pickFilter(sp.filter);

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/camps"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to camps
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <p className="flex items-center gap-2 text-xs text-ink-soft">
              <CalendarBlank size={14} weight="duotone" />
              <span>{formatDateRange(camp.startDate, camp.endDate)}</span>
              {camp.location ? <span>· {camp.location}</span> : null}
            </p>
            <h1 className="headline-display mt-2 text-3xl md:text-4xl">{camp.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-7 items-center border px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusStyle[camp.status]}`}
              >
                {camp.status}
              </span>
              {camp.capacity ? (
                <span className="inline-flex h-7 items-center border border-line bg-paper px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  Capacity {camp.capacity}
                </span>
              ) : null}
              <span className="inline-flex h-7 items-center border border-line bg-paper px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                ${camp.feePerCamper.toFixed(0)}/camper
              </span>
            </div>
          </div>
          <Link
            href={`/admin/camps/${camp.slug}/edit`}
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            <PencilSimple size={12} weight="bold" />
            Edit
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />

        {camp.status === "closed" ? (
          <div className="mt-6 border border-brass/40 bg-brass/10 p-4">
            <p className="font-display text-base tracking-tight text-ink">Registration is closed</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Reopen to accept registrations again. This clears the auto-close deadline so
              tomorrow&apos;s cron won&apos;t close it again. Set a new deadline in Edit if you
              want one later.
            </p>
            <form action={reopenCampAction} className="mt-3">
              <input type="hidden" name="id" value={camp.id} />
              <input type="hidden" name="slug" value={camp.slug} />
              <AdminSubmitButton idleLabel="Reopen registration" variant="secondary" />
            </form>
          </div>
        ) : null}
      </section>

      <nav
        aria-label="Camp tabs"
        className="mt-6 flex flex-wrap gap-1.5 border-b border-line pb-px"
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Link
              key={t.key}
              href={`/admin/camps/${camp.slug}?tab=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "border border-b-0 border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink"
                  : "px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
              }
            >
              {t.label}
              {t.key === "registrations" ? ` (${stats?.registeredCount ?? 0})` : null}
              {t.key === "waitlist"
                ? ` (${tab === "waitlist" ? waitlistEntries.filter((e) => e.status === "active" || e.status === "promoted").length : stats?.waitlistCount ?? 0})`
                : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === "registrations" ? (
          <RegistrationsTab camp={camp} rows={registrationRows} filter={filter} />
        ) : null}
        {tab === "waitlist" ? (
          <WaitlistTab camp={camp} entries={waitlistEntries} origin={siteOrigin} />
        ) : null}
        {tab === "settings" ? <SettingsTab camp={camp} /> : null}
      </div>
    </main>
  );
}

function RegistrationsTab({
  camp,
  rows,
  filter
}: {
  camp: Camp;
  rows: RegistrationRowData[];
  filter: FilterKey;
}) {
  const counts: Record<FilterKey, number> = {
    all: filterRegistrations(rows, "all").length,
    paid: filterRegistrations(rows, "paid").length,
    unpaid: filterRegistrations(rows, "unpaid").length,
    partial: filterRegistrations(rows, "partial").length,
    cash: filterRegistrations(rows, "cash").length,
    cancelled: filterRegistrations(rows, "cancelled").length
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {REGISTRATION_FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Link
                key={f.key}
                href={`/admin/camps/${camp.slug}?tab=registrations&filter=${f.key}`}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "inline-flex h-8 items-center gap-1.5 border border-pine bg-forest px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper"
                    : "inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
                }
              >
                {f.label}
                <span
                  className={
                    active
                      ? "rounded-sm bg-paper/15 px-1 text-[10px] text-paper"
                      : "rounded-sm bg-paper-deep/60 px-1 text-[10px] text-ink-soft"
                  }
                >
                  {counts[f.key]}
                </span>
              </Link>
            );
          })}
        </div>
        <details className="group relative">
          <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink [&::-webkit-details-marker]:hidden">
            <Plus size={12} weight="bold" />
            Add manually
          </summary>
          <ManualEntryForm campSlug={camp.slug} />
        </details>
      </div>

      <RegistrationsTable campSlug={camp.slug} rows={rows} filter={filter} />

      {!camp.registrationFormJotformId ? (
        <div className="border border-dashed border-line bg-paper-deep/15 p-5 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Registration form not connected</p>
          <p className="mt-1">
            Add your JotForm ID in{" "}
            <Link
              href={`/admin/camps/${camp.slug}/edit`}
              className="text-pine underline underline-offset-4 hover:text-forest"
            >
              camp settings
            </Link>{" "}
            so submissions flow in automatically.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ManualEntryForm({ campSlug }: { campSlug: string }) {
  return (
    <div className="absolute right-0 z-20 mt-2 w-[min(94vw,420px)] border border-line bg-paper p-5 shadow-lg">
      <p className="font-display text-base tracking-tight text-ink">Add registration manually</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        For drop-ins or families who pay before registering. An invoice and reference code are
        generated automatically.
      </p>
      <form action={createManualRegistrationAction} className="mt-4 space-y-3">
        <input type="hidden" name="slug" value={campSlug} />
        <AdminField label="Parent name">
          <input name="parentName" className={adminInputClass} />
        </AdminField>
        <AdminField label="Parent email">
          <input name="parentEmail" type="email" className={adminInputClass} />
        </AdminField>
        <AdminField label="Parent phone">
          <input name="parentPhone" className={adminInputClass} />
        </AdminField>
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Camper name">
            <input name="camperName" className={adminInputClass} />
          </AdminField>
          <AdminField label="Camper count">
            <input
              name="camperCount"
              type="number"
              min={1}
              defaultValue={1}
              className={adminInputClass}
            />
          </AdminField>
        </div>
        <AdminField label="Notes" hint="Internal only">
          <textarea name="notes" rows={2} className={adminTextareaClass} />
        </AdminField>
        <AdminSubmitButton
          idleLabel="Create registration"
          pendingLabel="Creating…"
          icon={<Plus size={14} weight="bold" />}
        />
      </form>
    </div>
  );
}

function WaitlistTab({
  camp,
  entries,
  origin
}: {
  camp: Camp;
  entries: WaitlistEntry[];
  origin: string;
}) {
  const claimUrlFor = (token: string | null) =>
    token ? buildClaimUrl(camp.slug, token, origin) : null;

  const active = entries.filter((e) => e.status === "active").length;
  const promoted = entries.filter((e) => e.status === "promoted").length;
  const expired = entries.filter((e) => e.status === "expired").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Active" value={active} tone="ok" />
        <Stat label="Promoted (awaiting claim)" value={promoted} tone="warn" />
        <Stat label="Expired" value={expired} tone="muted" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-relaxed text-ink-soft">
          Add a waitlist JotForm ID in <strong>Settings</strong> to fill this from your form
          submissions. You can also add entries manually below. After a family claims a spot,
          they move to <strong>Registrations</strong> and leave this list.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={expireOverdueClaimsAction}>
            <input type="hidden" name="slug" value={camp.slug} />
            <AdminSubmitButton
              idleLabel="Expire overdue"
              variant="secondary"
            />
          </form>
          <details className="group relative">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink [&::-webkit-details-marker]:hidden">
              <Plus size={12} weight="bold" />
              Add manually
            </summary>
            <WaitlistManualForm campSlug={camp.slug} />
          </details>
        </div>
      </div>

      <WaitlistTable
        campSlug={camp.slug}
        entries={entries}
        claimUrlFor={claimUrlFor}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn" | "muted";
}) {
  const toneClass =
    tone === "ok"
      ? "border-pine/40 bg-sky/40 text-forest"
      : tone === "warn"
        ? "border-brass/40 bg-brass/15 text-ink"
        : "border-line bg-paper-deep/40 text-ink-soft";
  return (
    <div className={`border ${toneClass} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}

function WaitlistManualForm({ campSlug }: { campSlug: string }) {
  return (
    <div className="absolute right-0 z-20 mt-2 w-[min(94vw,420px)] border border-line bg-paper p-5 shadow-lg">
      <p className="font-display text-base tracking-tight text-ink">Add to waitlist</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        Drops into the queue at the next position.
      </p>
      <form action={createManualWaitlistAction} className="mt-4 space-y-3">
        <input type="hidden" name="slug" value={campSlug} />
        <AdminField label="Parent name">
          <input name="parentName" className={adminInputClass} />
        </AdminField>
        <AdminField label="Parent email">
          <input name="parentEmail" type="email" className={adminInputClass} />
        </AdminField>
        <AdminField label="Parent phone">
          <input name="parentPhone" className={adminInputClass} />
        </AdminField>
        <AdminField label="Camper name">
          <input name="camperName" className={adminInputClass} />
        </AdminField>
        <AdminSubmitButton
          idleLabel="Add to waitlist"
          pendingLabel="Adding…"
          icon={<Plus size={14} weight="bold" />}
        />
      </form>
    </div>
  );
}

function SettingsTab({ camp }: { camp: Camp }) {
  const thankYouRedirect = jotformThankYouRedirectUrl(camp.slug);

  const rows: { label: string; value: React.ReactNode; hint?: string }[] = [
    { label: "Status", value: camp.status },
    {
      label: "Dates",
      value: formatDateRange(camp.startDate, camp.endDate)
    },
    { label: "Location", value: camp.location ?? "—" },
    {
      label: "Capacity",
      value: camp.capacity ? `${camp.capacity} campers` : "Unlimited"
    },
    {
      label: "Fee per camper",
      value: `$${camp.feePerCamper.toFixed(2)} CAD`
    },
    {
      label: "Registration form (JotForm)",
      value: camp.registrationFormJotformId ? (
        <>
          <code className="border border-line bg-paper px-2 py-0.5 text-xs">
            {camp.registrationFormJotformId}
          </code>{" "}
          <Link
            href={`https://www.jotform.com/build/${camp.registrationFormJotformId}`}
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-xs text-pine underline underline-offset-4 hover:text-forest"
          >
            Open in JotForm ↗
          </Link>
        </>
      ) : (
        <span className="text-ink-soft">Not set</span>
      )
    },
    {
      label: "Waitlist form (JotForm)",
      value: camp.waitlistFormJotformId ? (
        <>
          <code className="border border-line bg-paper px-2 py-0.5 text-xs">
            {camp.waitlistFormJotformId}
          </code>{" "}
          <Link
            href={`https://www.jotform.com/build/${camp.waitlistFormJotformId}`}
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-xs text-pine underline underline-offset-4 hover:text-forest"
          >
            Open in JotForm ↗
          </Link>
        </>
      ) : (
        <span className="text-ink-soft">Not set</span>
      )
    },
    {
      label: "JotForm thank-you redirect",
      value: (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-ink-soft">
            In JotForm → Settings → Thank You Page →{" "}
            <strong className="text-ink">Redirect to an external link</strong>. Paste this on
            both registration and waitlist forms. Keep{" "}
            <code className="border border-line bg-paper px-1 py-0.5 text-[11px]">{`{id}`}</code>{" "}
            exactly as shown.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all border border-line bg-paper px-2 py-1 text-xs">
              {thankYouRedirect}
            </code>
            <CopyButton
              value={thankYouRedirect}
              label="Copy"
              className="inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
            />
          </div>
        </div>
      )
    },
    {
      label: "E-Transfer email",
      value: camp.paymentEmail ?? (
        <span className="text-ink-soft">Uses PAYMENT_EMAIL env var</span>
      )
    },
    {
      label: "Public register URL",
      value: (
        <>
          <code className="border border-line bg-paper px-2 py-0.5 text-xs">
            /camp/{camp.slug}/register
          </code>{" "}
          <Link
            href={`/camp/${camp.slug}/register`}
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-xs text-pine underline underline-offset-4 hover:text-forest"
          >
            Open ↗
          </Link>
        </>
      )
    },
    {
      label: "Registration closes at",
      value: camp.registrationClosesAt
        ? new Date(camp.registrationClosesAt).toLocaleString("en-CA")
        : "No deadline"
    },
    {
      label: "Auto-close at capacity",
      value: camp.autoCloseAtCapacity ? "Yes" : "No"
    },
    {
      label: "Internal notes",
      value: camp.notes ?? "—"
    }
  ];

  return (
    <div className="border border-line bg-paper-deep/35 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-brass">Settings</p>
          <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
            Camp configuration
          </h2>
        </div>
        <Link
          href={`/admin/camps/${camp.slug}/edit`}
          className="inline-flex h-10 items-center gap-1.5 bg-forest px-4 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
        >
          <PencilSimple size={12} weight="bold" /> Edit camp
        </Link>
      </div>

      <dl className="mt-6 divide-y divide-line/60">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 py-4 md:grid-cols-[200px_1fr] md:items-start md:gap-6"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {row.label}
            </dt>
            <dd className="text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
