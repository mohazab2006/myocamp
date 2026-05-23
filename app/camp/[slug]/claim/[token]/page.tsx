import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Tent,
  Warning,
  XCircle
} from "@phosphor-icons/react/ssr";

import { fetchCampBySlug } from "@/lib/admin/camps";
import { findWaitlistByClaimToken } from "@/lib/admin/waitlist";
import type { Camp, WaitlistEntry, WaitlistEntryStatus } from "@/lib/types";
import { acceptClaimAction } from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; token: string }>;
type Search = Promise<{ status?: string }>;

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

function timeUntil(iso: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;
  const hrs = Math.floor(ms / 3_600_000);
  if (hrs < 1) return "less than 1 hr";
  if (hrs < 24) return `${hrs} hr`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export default async function CampClaimPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: Search;
}) {
  const { slug, token } = await params;
  const sp = searchParams ? await searchParams : ({} as Awaited<Search>);
  const flashStatus = sp.status ?? null;

  const camp = await fetchCampBySlug(slug);
  if (!camp) notFound();

  const entry = await findWaitlistByClaimToken(token);

  return (
    <main className="min-h-dvh bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <Link
          href="/camp"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
        >
          ← Back to camp
        </Link>

        <section className="mt-5 border border-line bg-paper-deep/40 p-6 md:p-8">
          <p className="eyebrow text-brass flex items-center gap-2">
            <Tent size={14} weight="duotone" /> A spot opened up
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
        </section>

        {flashStatus ? <FlashBanner status={flashStatus} /> : null}

        {!entry ? (
          <InvalidState />
        ) : entry.status === "claimed" ? (
          <AlreadyClaimedState />
        ) : entry.status === "expired" ||
          (entry.claimExpiresAt && new Date(entry.claimExpiresAt).getTime() < Date.now()) ? (
          <ExpiredState />
        ) : entry.status === "promoted" ? (
          <PromotedState camp={camp} entry={entry} token={token} />
        ) : (
          <InvalidState />
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

function PromotedState({
  camp,
  entry,
  token
}: {
  camp: Camp;
  entry: WaitlistEntry;
  token: string;
}) {
  const remaining = timeUntil(entry.claimExpiresAt);
  return (
    <section className="mt-5 border-2 border-pine/40 bg-sky/35 p-6 md:p-8">
      <p className="font-display text-2xl text-ink">
        Welcome back{entry.parentName ? `, ${entry.parentName.split(" ")[0]}` : ""}.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        A spot just opened on the {camp.title} roster and you're next on the waitlist. Confirm
        below to claim it. We'll send you straight to the payment page right after.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Fact label="Camper" value={entry.camperName ?? "(add on the next screen)"} />
        <Fact label="Parent" value={entry.parentName ?? entry.parentEmail ?? "—"} />
        <Fact
          label="Fee per camper"
          value={`$${camp.feePerCamper.toFixed(2)} CAD`}
        />
        <Fact
          label="Time to confirm"
          value={remaining ? `~${remaining}` : "Hurry — almost expired"}
          icon={<Clock size={12} weight="duotone" />}
        />
      </div>

      <form action={acceptClaimAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="slug" value={camp.slug} />
        {!entry.camperName ? (
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Camper name (optional — you can edit later)
            </span>
            <input
              name="camperName"
              className="min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm"
              placeholder="e.g. Salma Hassan"
            />
          </label>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
        >
          <CheckCircle size={16} weight="bold" /> Confirm my spot
          <ArrowRight size={16} weight="bold" />
        </button>
        <p className="text-xs leading-relaxed text-ink-soft">
          By confirming you agree to pay the registration fee on the next screen (PayPal,
          e-Transfer, or cash at drop-off). The link below stops working once you confirm.
        </p>
      </form>
    </section>
  );
}

function ExpiredState() {
  return (
    <section className="mt-5 border-2 border-ember/40 bg-ember/10 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <Clock size={26} weight="duotone" className="mt-1 text-ember" />
        <div>
          <p className="font-display text-xl text-ink">Claim window closed</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This claim link has expired. If you'd still like to attend, contact us — if your
            spot is still open we can re-issue the link.
          </p>
        </div>
      </div>
    </section>
  );
}

function AlreadyClaimedState() {
  return (
    <section className="mt-5 border-2 border-pine/40 bg-sky/35 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle size={26} weight="fill" className="mt-1 text-forest" />
        <div>
          <p className="font-display text-xl text-ink">Already claimed</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This spot has already been confirmed. Check your email for the payment link, or{" "}
            <Link href="/camp" className="text-pine underline">
              return to the camp page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function InvalidState() {
  return (
    <section className="mt-5 border-2 border-line bg-paper-deep/35 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <XCircle size={26} weight="duotone" className="mt-1 text-ink-soft" />
        <div>
          <p className="font-display text-xl text-ink">Link not recognized</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This claim link isn't valid. It may have been revoked or replaced. Contact us if
            you think this is a mistake.
          </p>
        </div>
      </div>
    </section>
  );
}

function FlashBanner({ status }: { status: string }) {
  const map: Record<string, { tone: "ok" | "warn" | "info"; icon: React.ReactNode; label: string }> = {
    "already-claimed": {
      tone: "ok",
      icon: <CheckCircle size={18} weight="fill" />,
      label: "This spot is already claimed."
    },
    expired: {
      tone: "warn",
      icon: <Clock size={18} weight="duotone" />,
      label: "This claim link has expired."
    },
    invalid: {
      tone: "warn",
      icon: <Warning size={18} weight="duotone" />,
      label: "We couldn't validate that link."
    },
    error: {
      tone: "warn",
      icon: <Warning size={18} weight="duotone" />,
      label: "Something went wrong. Try again or contact us."
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
      className={`mt-5 flex items-center gap-2 border px-4 py-3 text-sm font-medium ${tones[entry.tone]}`}
    >
      {entry.icon}
      <span>{entry.label}</span>
    </div>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  // Touch unused import lint guard — Info icon used as fallback when no value
  void icon;
  return (
    <div className="border border-line bg-paper p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {icon ?? <Info size={11} weight="duotone" />}
        {label}
      </p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}
