import Link from "next/link";
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { EventForm } from "@/components/admin/event-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampsForEventLink } from "@/lib/admin/camps";

export const dynamic = "force-dynamic";

export default async function AdminEventsNewPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
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
        <div className="flex items-center gap-3 text-pine">
          <CalendarBlank size={22} weight="duotone" />
          <span className="eyebrow text-brass">New event</span>
        </div>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">Create an event.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Drag a photo into the hero image field — it uploads to Supabase Storage. Community events
          need a registration URL; camp sessions can link to a camp instead.
        </p>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <EventForm camps={camps} />
      </div>
    </main>
  );
}
