import Link from "next/link";
import type { OrgEvent } from "@/lib/types";
import { formatRange } from "@/lib/date";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";

const typeLabels: Record<OrgEvent["type"], string> = {
  hike: "Hike",
  campfire: "Campfire",
  fundraiser: "Fundraiser",
  social: "Social",
  service: "Service",
  camp: "Camp",
  workshop: "Workshop"
};

export function EventCard({ event, tone = "paper" }: { event: OrgEvent; tone?: "paper" | "deep" }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col gap-4 transition"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
        {event.heroImage && (
          <img
            src={event.heroImage}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-ink">
          {typeLabels[event.type]}
        </span>
      </div>
      <div className={tone === "deep" ? "text-paper" : ""}>
        <div className={`text-xs uppercase tracking-[0.16em] ${tone === "deep" ? "text-paper/70" : "text-ink-soft"}`}>
          {formatRange(event.startDate, event.endDate)} · {event.location}
        </div>
        <h3 className="font-display mt-2 text-2xl leading-tight tracking-tight">
          {event.title}
        </h3>
        <p className={`mt-2 max-w-[42ch] text-sm leading-relaxed ${tone === "deep" ? "text-paper/80" : "text-ink-soft"}`}>
          {event.blurb}
        </p>
        <div className={`mt-3 inline-flex items-center gap-1.5 text-sm ${tone === "deep" ? "text-paper" : "text-ink"}`}>
          Read more <ArrowUpRight size={14} weight="bold" className="transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
