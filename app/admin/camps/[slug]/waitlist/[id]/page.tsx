import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  Clock,
  XCircle
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { CopyButton } from "@/components/admin/copy-button";
import { JotformResponsesPanel } from "@/components/admin/jotform-responses-panel";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampBySlug } from "@/lib/admin/camps";
import { buildClaimUrl, fetchWaitlistEntryById } from "@/lib/admin/waitlist";
import { SITE_URL } from "@/lib/site";
import type { WaitlistEntry, WaitlistEntryStatus } from "@/lib/types";
import {
  moveWaitlistAction,
  promoteWaitlistAction,
  reactivateWaitlistAction,
  removeWaitlistAction,
  unpromoteWaitlistAction
} from "../actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; id: string }>;

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

const STATUS_LABEL: Record<WaitlistEntryStatus, string> = {
  active: "Active",
  promoted: "Promoted",
  claimed: "Claimed",
  expired: "Expired",
  removed: "Removed"
};

export default async function AdminWaitlistDetailPage({
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

  const entry = await fetchWaitlistEntryById(id);
  if (!entry || entry.campId !== camp.id) notFound();

  const claimUrl = entry.claimToken
    ? buildClaimUrl(camp.slug, entry.claimToken, SITE_URL)
    : null;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href={`/admin/camps/${slug}?tab=waitlist`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> {camp.title} · Waitlist
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs text-ink-soft">
              <CalendarBlank size={14} weight="duotone" />
              Joined {fmtDateTime(entry.submittedAt)}
              {entry.position != null ? ` · #${entry.position} in line` : null}
            </p>
            <h1 className="headline-display mt-2 text-3xl">
              {entry.camperName ?? entry.parentName ?? entry.parentEmail ?? "Waitlist entry"}
            </h1>
            {entry.camperName && entry.parentName ? (
              <p className="mt-2 text-sm text-ink-soft">Parent: {entry.parentName}</p>
            ) : null}
            {entry.parentEmail ? (
              <p className="mt-1 text-sm text-ink-soft">{entry.parentEmail}</p>
            ) : null}
            {entry.parentPhone ? (
              <p className="mt-1 text-sm text-ink-soft">{entry.parentPhone}</p>
            ) : null}
            <div className="mt-3">
              <StatusPill status={entry.status} />
            </div>
          </div>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {entry.status === "promoted" && claimUrl ? (
            <section className="border border-brass/40 bg-brass/10 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Claim link
              </p>
              <code className="mt-2 block break-all border border-line bg-paper p-3 text-xs text-ink">
                {claimUrl}
              </code>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={claimUrl} label="Copy link" />
                <Link
                  href={claimUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft hover:border-pine hover:text-ink"
                >
                  Open
                </Link>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Expires {fmtDateTime(entry.claimExpiresAt)}
              </p>
            </section>
          ) : null}

          {entry.status === "claimed" && entry.claimedRegistrationId ? (
            <section className="border border-pine/40 bg-sky/45 p-5 text-sm text-ink">
              Converted to registration —{" "}
              <Link
                href={`/admin/camps/${slug}/registrations/${entry.claimedRegistrationId}`}
                className="text-pine underline underline-offset-4 hover:text-forest"
              >
                View registration
              </Link>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 border border-line bg-paper p-5">
          <p className="eyebrow text-brass">Actions</p>
          {entry.status === "active" ? (
            <>
              <form action={promoteWaitlistAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={entry.id} />
                <input type="hidden" name="ttlHours" value="48" />
                <AdminSubmitButton idleLabel="Promote (48h)" pendingLabel="Promoting…" />
              </form>
              <div className="flex gap-2">
                <form action={moveWaitlistAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="direction" value="up" />
                  <AdminSubmitButton idleLabel="Move up" variant="ghost" />
                </form>
                <form action={moveWaitlistAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="direction" value="down" />
                  <AdminSubmitButton idleLabel="Move down" variant="ghost" />
                </form>
              </div>
              <form action={removeWaitlistAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={entry.id} />
                <AdminSubmitButton idleLabel="Remove from waitlist" variant="secondary" />
              </form>
            </>
          ) : null}
          {entry.status === "promoted" ? (
            <form action={unpromoteWaitlistAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={entry.id} />
              <AdminSubmitButton idleLabel="Cancel promotion" variant="ghost" />
            </form>
          ) : null}
          {entry.status === "expired" || entry.status === "removed" ? (
            <form action={reactivateWaitlistAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={entry.id} />
              <AdminSubmitButton idleLabel="Re-add to waitlist" variant="secondary" />
            </form>
          ) : null}
        </aside>
      </div>

      <div className="mt-6">
        <JotformResponsesPanel
          rawPayload={entry.rawPayload}
          emptyHint="No waitlist form answers stored yet. Submissions from the waitlist JotForm will appear here."
        />
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: WaitlistEntryStatus }) {
  const label = STATUS_LABEL[status];
  const tones: Record<WaitlistEntryStatus, string> = {
    active: "border-line bg-paper-deep/60 text-ink-soft",
    promoted: "border-brass/40 bg-brass/15 text-ink",
    claimed: "border-pine/40 bg-sky/55 text-forest",
    expired: "border-ember/40 bg-ember/10 text-ember",
    removed: "border-line bg-paper-deep/30 text-ink-soft"
  };
  const icons: Record<WaitlistEntryStatus, React.ReactNode> = {
    active: <Clock size={12} weight="duotone" />,
    promoted: <Clock size={12} weight="duotone" />,
    claimed: <CheckCircle size={12} weight="fill" />,
    expired: <Clock size={12} weight="duotone" />,
    removed: <XCircle size={12} weight="duotone" />
  };
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 border px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones[status]}`}
    >
      {icons[status]}
      {label}
    </span>
  );
}
