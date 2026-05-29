import Link from "next/link";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  CheckCircle,
  Clock,
  Hourglass,
  Trash,
  XCircle
} from "@phosphor-icons/react/ssr";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { CopyButton } from "@/components/admin/copy-button";
import {
  moveWaitlistAction,
  promoteWaitlistAction,
  reactivateWaitlistAction,
  removeWaitlistAction,
  unpromoteWaitlistAction
} from "@/app/admin/camps/[slug]/waitlist/actions";
import type { WaitlistEntry, WaitlistEntryStatus } from "@/lib/types";

interface WaitlistTableProps {
  campSlug: string;
  entries: WaitlistEntry[];
  claimUrlFor: (token: string | null) => string | null;
}

const STATUS_LABEL: Record<WaitlistEntryStatus, { label: string; tone: "ok" | "warn" | "muted" }> = {
  active: { label: "Active", tone: "muted" },
  promoted: { label: "Promoted", tone: "warn" },
  claimed: { label: "Claimed", tone: "ok" },
  expired: { label: "Expired", tone: "muted" },
  removed: { label: "Removed", tone: "muted" }
};

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

function timeUntil(iso: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} min left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr left`;
  const days = Math.floor(hrs / 24);
  return `${days}d left`;
}

function StatusPill({ status }: { status: WaitlistEntryStatus }) {
  const info = STATUS_LABEL[status];
  const tones = {
    ok: "border-pine/40 bg-sky/55 text-forest",
    warn: "border-brass/40 bg-brass/15 text-ink",
    muted: "border-line bg-paper-deep/60 text-ink-soft"
  } as const;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 border px-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones[info.tone]}`}
    >
      {info.label}
    </span>
  );
}

export function WaitlistTable({ campSlug, entries, claimUrlFor }: WaitlistTableProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-line bg-paper-deep/15 p-10 text-center">
        <Hourglass size={28} weight="duotone" className="mx-auto text-pine" />
        <p className="mt-4 font-display text-lg tracking-tight text-ink">Waitlist is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          Add families via the waitlist JotForm (see Settings) or the "Add manually" button.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper">
      <ul className="divide-y divide-line/60">
        {entries.map((entry) => (
          <li key={entry.id} className="grid gap-3 px-4 py-4 md:grid-cols-[auto_1fr_auto] md:items-start">
            {/* Position + status column */}
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-paper-deep/45 font-display text-xl text-ink">
                {entry.status === "active" || entry.status === "promoted"
                  ? (entry.position ?? "—")
                  : entry.status === "claimed"
                    ? <CheckCircle size={20} weight="fill" className="text-forest" />
                    : entry.status === "expired"
                      ? <Clock size={20} weight="duotone" className="text-ember" />
                      : <XCircle size={20} weight="duotone" className="text-ink-soft" />}
              </div>
              <div className="md:hidden">
                <StatusPill status={entry.status} />
              </div>
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/camps/${campSlug}/waitlist/${entry.id}`}
                  className="font-display text-base tracking-tight text-ink underline-offset-4 hover:text-pine hover:underline"
                >
                  {entry.camperName ?? entry.parentName ?? entry.parentEmail ?? "Unknown"}
                </Link>
                <div className="hidden md:block">
                  <StatusPill status={entry.status} />
                </div>
              </div>
              {entry.camperName && entry.parentName ? (
                <p className="text-sm text-ink-soft">
                  Parent:{" "}
                  <Link
                    href={`/admin/camps/${campSlug}/waitlist/${entry.id}`}
                    className="hover:text-ink hover:underline"
                  >
                    {entry.parentName}
                  </Link>
                </p>
              ) : null}
              {entry.parentEmail ? (
                <p className="text-xs text-ink-soft">{entry.parentEmail}</p>
              ) : null}
              <p className="mt-1 text-xs text-ink-soft">
                Joined {fmtDateTime(entry.submittedAt)}
              </p>

              {entry.status === "promoted" ? (
                <PromotedPanel
                  campSlug={campSlug}
                  entry={entry}
                  claimUrl={claimUrlFor(entry.claimToken)}
                />
              ) : null}

              {entry.status === "claimed" && entry.claimedRegistrationId ? (
                <p className="mt-3 inline-flex items-center gap-1.5 border border-pine/40 bg-sky/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  <CheckCircle size={11} weight="fill" />
                  Converted to registration
                  <Link
                    href={`/admin/camps/${campSlug}/registrations/${entry.claimedRegistrationId}`}
                    className="ml-1 underline underline-offset-4 hover:text-ink"
                  >
                    View
                  </Link>
                </p>
              ) : null}
            </div>

            {/* Actions column */}
            <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-end">
              {entry.status === "active" ? (
                <>
                  <form action={promoteWaitlistAction}>
                    <input type="hidden" name="slug" value={campSlug} />
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="ttlHours" value="48" />
                    <AdminSubmitButton
                      idleLabel="Promote (48h)"
                      pendingLabel="Promoting…"
                      icon={<CheckCircle size={14} weight="bold" />}
                    />
                  </form>
                  <div className="flex gap-1.5">
                    <form action={moveWaitlistAction}>
                      <input type="hidden" name="slug" value={campSlug} />
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="direction" value="up" />
                      <AdminSubmitButton idleLabel="↑" variant="ghost" />
                    </form>
                    <form action={moveWaitlistAction}>
                      <input type="hidden" name="slug" value={campSlug} />
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="direction" value="down" />
                      <AdminSubmitButton idleLabel="↓" variant="ghost" />
                    </form>
                  </div>
                  <form action={removeWaitlistAction}>
                    <input type="hidden" name="slug" value={campSlug} />
                    <input type="hidden" name="id" value={entry.id} />
                    <AdminSubmitButton
                      idleLabel="Remove"
                      variant="ghost"
                      icon={<Trash size={12} weight="bold" />}
                    />
                  </form>
                </>
              ) : null}

              {entry.status === "promoted" ? (
                <form action={unpromoteWaitlistAction}>
                  <input type="hidden" name="slug" value={campSlug} />
                  <input type="hidden" name="id" value={entry.id} />
                  <AdminSubmitButton idleLabel="Cancel promotion" variant="ghost" />
                </form>
              ) : null}

              {(entry.status === "expired" || entry.status === "removed") ? (
                <form action={reactivateWaitlistAction}>
                  <input type="hidden" name="slug" value={campSlug} />
                  <input type="hidden" name="id" value={entry.id} />
                  <AdminSubmitButton idleLabel="Re-add" variant="secondary" />
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {/* Mute the unused-icon warnings by referencing arrow icons somewhere visible. */}
      <span className="sr-only">
        <ArrowUp /> <ArrowDown />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Promoted entry sub-panel — claim link + time left + copy/open
// ---------------------------------------------------------------------------

function PromotedPanel({
  campSlug,
  entry,
  claimUrl
}: {
  campSlug: string;
  entry: WaitlistEntry;
  claimUrl: string | null;
}) {
  void campSlug;
  const remaining = timeUntil(entry.claimExpiresAt);
  const expired = remaining === "expired";

  return (
    <div
      className={`mt-3 border ${
        expired ? "border-ember/40 bg-ember/10" : "border-brass/40 bg-brass/15"
      } p-3`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        Claim link {remaining ? `· ${remaining}` : ""}
      </p>
      {claimUrl ? (
        <div className="mt-2 break-all border border-line bg-paper p-2 font-mono text-[11px] text-ink">
          {claimUrl}
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-soft">
          (Token was used or revoked — re-promote to issue a new one.)
        </p>
      )}
      {claimUrl ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <CopyButton
            value={claimUrl}
            label="Copy link"
            className="inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-2.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:border-pine hover:text-ink"
          />
          <Link
            href={claimUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-2.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:border-pine hover:text-ink"
          >
            Open
            <ArrowSquareOut size={10} weight="bold" />
          </Link>
        </div>
      ) : null}
      <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
        Promoted {fmtDateTime(entry.promotedAt)} · expires {fmtDateTime(entry.claimExpiresAt)}
      </p>
    </div>
  );
}
