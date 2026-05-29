import Link from "next/link";
import { ArrowSquareOut, PencilSimple, Trash } from "@phosphor-icons/react/ssr";

import { AdminDeleteForm } from "@/components/admin/delete-form";
import { formatRange } from "@/lib/date";
import type { OrgEvent } from "@/lib/types";

const typeLabels: Record<OrgEvent["type"], string> = {
  hike: "Hike",
  campfire: "Campfire",
  fundraiser: "Fundraiser",
  social: "Social",
  service: "Service",
  camp: "Camp",
  workshop: "Workshop"
};

type AdminEventCardProps = {
  event: OrgEvent;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function AdminEventCard({ event, deleteAction }: AdminEventCardProps) {
  const cardImage = event.heroImage ?? null;

  return (
    <article className="group flex flex-col gap-4 border border-line bg-paper-deep/20 p-4 transition hover:border-pine md:p-5">
      <div className="relative aspect-4/3 overflow-hidden bg-paper-deep">
        {cardImage ? (
          <img src={cardImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.16em] text-ink-soft">
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-ink">
          {typeLabels[event.type]}
        </span>
        {event.campSlug ? (
          <span className="absolute right-3 top-3 rounded-full bg-pine px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-paper">
            Camp
          </span>
        ) : null}
        {event.archived ? (
          <span className="absolute bottom-3 left-3 rounded-full border border-line bg-paper/90 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Archived
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="text-xs uppercase tracking-[0.16em] text-ink-soft">
          {formatRange(event.startDate, event.endDate)} · {event.location}
        </div>
        <h3 className="font-display mt-2 text-2xl leading-tight tracking-tight text-ink">
          {event.title}
        </h3>
        {event.cost ? (
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-brass">{event.cost}</p>
        ) : null}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{event.blurb}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Link
            href={`/admin/events/${event.slug}/edit`}
            className="inline-flex h-10 items-center gap-1.5 bg-forest px-4 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
          >
            <PencilSimple size={12} weight="bold" />
            Edit
          </Link>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
          <AdminDeleteForm
            action={deleteAction}
            slug={event.slug}
            label="Delete"
            confirmMessage={`Delete "${event.title}"? This cannot be undone.`}
            icon={<Trash size={14} weight="bold" />}
            className="ml-auto"
          />
        </div>
      </div>
    </article>
  );
}
