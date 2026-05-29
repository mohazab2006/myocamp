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
import { buildPaymentUrl } from "@/lib/admin/payment-links";
import { findWaitlistByClaimToken } from "@/lib/admin/waitlist";
import { SITE_URL } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ClaimConfirmButton } from "@/components/camp/ClaimConfirmButton";
import type { Camp, WaitlistEntry } from "@/lib/types";

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
  const siteOrigin = SITE_URL;
  const claimedPaymentUrl =
    entry?.status === "claimed"
      ? await paymentUrlForClaimedRegistration(entry.claimedRegistrationId, siteOrigin)
      : null;

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
          <AlreadyClaimedState paymentUrl={claimedPaymentUrl} />
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

      <ClaimConfirmButton
        slug={camp.slug}
        token={token}
        showCamperNameField={!entry.camperName}
      />
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

function AlreadyClaimedState({ paymentUrl }: { paymentUrl: string | null }) {
  return (
    <section className="mt-5 border-2 border-pine/40 bg-sky/35 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle size={26} weight="fill" className="mt-1 text-forest" />
        <div>
          <p className="font-display text-xl text-ink">Spot confirmed</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            You already confirmed this spot. Continue to payment below, or check your email for
            the payment link.
          </p>
          {paymentUrl ? (
            <Link
              href={paymentUrl}
              className="mt-4 inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
            >
              Go to payment page <ArrowRight size={16} weight="bold" />
            </Link>
          ) : (
            <Link href="/camp" className="mt-4 inline-block text-pine underline">
              Return to camp page
            </Link>
          )}
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

async function paymentUrlForClaimedRegistration(
  registrationId: string | null,
  origin: string
): Promise<string | null> {
  if (!registrationId) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("invoices")
    .select("reference_code")
    .eq("registration_id", registrationId)
    .maybeSingle();
  const ref = (data as { reference_code: string } | null)?.reference_code;
  if (!ref) return null;
  return buildPaymentUrl(ref, origin);
}
