import Link from "next/link";
import { ArrowSquareOut, CalendarBlank, Plus, Trash } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { EventForm } from "@/components/admin/event-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampsForEventLink } from "@/lib/admin/camps";
import { getEvents } from "@/lib/content/events";

import { deleteEventAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const events = await getEvents();
  const camps = await fetchCampsForEventLink();
  const liveCount = events.filter((event) => !event.archived).length;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Events</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">
              Add or edit event pages.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Events appear on <code className="border border-line bg-paper px-1 py-0.5 text-xs">/events</code>{" "}
              and each one gets its own page at <code className="border border-line bg-paper px-1 py-0.5 text-xs">/events/[slug]</code>.
              Drag a photo into the Hero image field — it uploads to Supabase Storage.
            </p>
          </div>
          <Link
            href="/events"
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View live
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <Plus size={14} weight="bold" /> Add a new event
      </div>
      <div className="mt-3">
        <EventForm camps={camps} />
      </div>

      <div className="mt-12 flex items-center gap-3 border-b border-line pb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <CalendarBlank size={14} weight="bold" /> Existing events ({events.length} · {liveCount} live)
      </div>

      <div className="mt-6 grid gap-10">
        {events.length === 0 ? (
          <p className="border border-dashed border-line bg-paper-deep/20 p-6 text-sm text-ink-soft">
            No events yet. Use the form above to add your first event.
          </p>
        ) : null}

        {events.map((event) => (
          <div key={event.slug} className="grid gap-3">
            <EventForm event={event} camps={camps} />
            <form action={deleteEventAction} className="flex justify-end">
              <input type="hidden" name="slug" value={event.slug} />
              <AdminSubmitButton
                idleLabel="Delete event"
                pendingLabel="Deleting…"
                variant="danger"
                icon={<Trash size={14} weight="bold" />}
              />
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
