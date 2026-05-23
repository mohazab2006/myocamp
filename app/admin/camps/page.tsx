import Link from "next/link";
import {
  ArrowSquareOut,
  CalendarBlank,
  CurrencyDollar,
  PencilSimple,
  Plus,
  Tent,
  Users
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCamps, fetchCampStats } from "@/lib/admin/camps";
import type { Camp } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusStyle: Record<Camp["status"], string> = {
  open: "border-pine/40 bg-sky/55 text-forest",
  full: "border-brass/40 bg-brass/15 text-ink",
  draft: "border-line bg-paper-deep/60 text-ink-soft",
  closed: "border-line bg-paper-deep/60 text-ink-soft",
  archived: "border-line bg-paper-deep/30 text-ink-soft"
};

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

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(cents);
}

export default async function AdminCampsPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  const camps = await fetchCamps();
  const stats = await fetchCampStats(camps.map((c) => c.id));

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Camps</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">
              Manage every camp in one place.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Each camp has its own registration form, waitlist form, payment pipeline, and
              dashboard. Add new camps any time. Older camps stay searchable in the archive.
            </p>
          </div>
          <Link
            href="/admin/camps/new"
            className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
          >
            <Plus size={16} weight="bold" /> Add new camp
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      {camps.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-paper-deep/15 p-10 text-center">
          <Tent size={32} weight="duotone" className="mx-auto text-pine" />
          <p className="mt-4 font-display text-xl tracking-tight text-ink">No camps yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Add your first camp to start collecting registrations. You can swap JotForm IDs,
            change fees, or archive any time without touching code.
          </p>
          <Link
            href="/admin/camps/new"
            className="mt-6 inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
          >
            <Plus size={16} weight="bold" /> Create your first camp
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {camps.map((camp) => {
            const stat = stats[camp.id];
            return (
              <article
                key={camp.id}
                className="flex flex-col gap-5 border border-line bg-paper-deep/35 p-6 transition hover:border-pine"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs text-ink-soft">
                      <CalendarBlank size={14} weight="duotone" />
                      <span>{formatDateRange(camp.startDate, camp.endDate)}</span>
                    </p>
                    <h2 className="mt-1 font-display text-2xl tracking-tight text-ink">
                      {camp.title}
                    </h2>
                    {camp.location ? (
                      <p className="mt-1 text-sm text-ink-soft">{camp.location}</p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex h-7 items-center border px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusStyle[camp.status]}`}
                  >
                    {camp.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 border-y border-line py-4">
                  <Stat
                    icon={<Users size={16} weight="duotone" className="text-pine" />}
                    label="Registered"
                    value={stat?.registeredCount ?? 0}
                    sub={
                      camp.capacity
                        ? `of ${camp.capacity}`
                        : stat && stat.waitlistCount > 0
                          ? `+ ${stat.waitlistCount} waitlist`
                          : undefined
                    }
                  />
                  <Stat
                    icon={
                      <CurrencyDollar size={16} weight="duotone" className="text-pine" />
                    }
                    label="Paid"
                    value={stat?.paidCount ?? 0}
                    sub={`${stat?.unpaidCount ?? 0} unpaid`}
                  />
                  <Stat
                    icon={
                      <CurrencyDollar size={16} weight="duotone" className="text-pine" />
                    }
                    label="Collected"
                    value={formatCurrency(stat?.collected ?? 0)}
                    sub={
                      stat && stat.outstanding > 0
                        ? `${formatCurrency(stat.outstanding)} due`
                        : undefined
                    }
                  />
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/camps/${camp.slug}`}
                    className="inline-flex h-10 items-center gap-1.5 bg-forest px-4 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
                  >
                    Open
                    <ArrowSquareOut size={12} weight="bold" />
                  </Link>
                  <Link
                    href={`/admin/camps/${camp.slug}/edit`}
                    className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
                  >
                    <PencilSimple size={12} weight="bold" />
                    Edit
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  sub
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="grid gap-1">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {icon}
        {label}
      </p>
      <p className="font-display text-xl tracking-tight text-ink">{value}</p>
      {sub ? <p className="text-[11px] text-ink-soft">{sub}</p> : null}
    </div>
  );
}
