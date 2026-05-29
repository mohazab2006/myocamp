import Link from "next/link";
import { ArrowSquareOut, CalendarBlank, Plus } from "@phosphor-icons/react/ssr";

import { AdminEventCard } from "@/components/admin/admin-event-card";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminEvents } from "@/lib/content/events";
import { isUpcoming } from "@/lib/date";
import { isSupabaseConfigured } from "@/lib/supabase/content";
import type { OrgEvent } from "@/lib/types";

import { deleteEventAction } from "../actions";

export const dynamic = "force-dynamic";

function sortAdminEvents(events: OrgEvent[]) {
  const upcoming = events
    .filter((event) => isUpcoming(event))
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  const past = events
    .filter((event) => !isUpcoming(event))
    .sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
  return [...upcoming, ...past];
}

export default async function AdminEventsPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const events = sortAdminEvents(await getAdminEvents());
  const supabaseContent = isSupabaseConfigured();
  const liveCount = events.filter((event) => !event.archived).length;

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Events</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">Manage event pages.</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Events appear on <code className="border border-line bg-paper px-1 py-0.5 text-xs">/events</code>{" "}
              and each one gets its own page at{" "}
              <code className="border border-line bg-paper px-1 py-0.5 text-xs">/events/[slug]</code>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/events"
              target="_blank"
              className="inline-flex h-11 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              View live
              <ArrowSquareOut size={12} weight="bold" />
            </Link>
            <Link
              href="/admin/events/new"
              className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
            >
              <Plus size={16} weight="bold" /> Add event
            </Link>
          </div>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-10 flex items-center gap-3 border-b border-line pb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <CalendarBlank size={14} weight="bold" /> All events ({events.length} · {liveCount} live)
      </div>

      {events.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-paper-deep/20 p-10 text-center">
          <p className="font-display text-xl tracking-tight text-ink">No events yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Create your first event to show it on the public calendar.
            {supabaseContent ? " Demo events on the live site disappear once you add real ones here." : null}
          </p>
          <Link
            href="/admin/events/new"
            className="mt-6 inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
          >
            <Plus size={16} weight="bold" /> Add your first event
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <AdminEventCard key={event.slug} event={event} deleteAction={deleteEventAction} />
          ))}
        </div>
      )}
    </main>
  );
}
