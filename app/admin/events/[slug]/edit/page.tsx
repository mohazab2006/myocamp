import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, CalendarBlank } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { EventForm } from "@/components/admin/event-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampsForEventLink } from "@/lib/admin/camps";
import { getAdminEvent } from "@/lib/content/events";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function AdminEventEditPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { slug } = await params;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const event = await getAdminEvent(slug);
  if (!event) notFound();

  const camps = await fetchCampsForEventLink();

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to events
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-pine">
              <CalendarBlank size={22} weight="duotone" />
              <span className="eyebrow text-brass">Edit event</span>
            </div>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">{event.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Changes publish immediately on the public events page.
            </p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View live
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <EventForm event={event} camps={camps} />
      </div>
    </main>
  );
}
