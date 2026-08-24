"use client";

import { useMemo, useState } from "react";
import type { EventType, OrgEvent } from "@/lib/types";
import {
  EVENT_AUDIENCE_OPTIONS,
  eventMatchesAudienceFilter,
  type EventAudienceFilter
} from "@/lib/content/event-audience";
import { isPast, isUpcoming } from "@/lib/date";
import { EventCard } from "./EventCard";
import type { EventLinkedCampSummary } from "./EventCampPanel";

const typeOptions: { value: EventType; label: string }[] = [
  { value: "hike", label: "Hike" },
  { value: "campfire", label: "Campfire" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "social", label: "Social" },
  { value: "service", label: "Service" },
  { value: "camp", label: "Camp" },
  { value: "workshop", label: "Workshop" }
];

function isCampEvent(event: OrgEvent): boolean {
  return Boolean(event.campSlug);
}

function EventGrid({
  events,
  linkedCampsBySlug
}: {
  events: OrgEvent[];
  linkedCampsBySlug: Record<string, EventLinkedCampSummary>;
}) {
  if (events.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
      {events.map((e) => (
        <EventCard
          key={e.slug}
          event={e}
          linkedCamp={e.campSlug ? linkedCampsBySlug[e.campSlug] : null}
        />
      ))}
    </div>
  );
}

export function EventFilters({
  events,
  linkedCampsBySlug = {}
}: {
  events: OrgEvent[];
  linkedCampsBySlug?: Record<string, EventLinkedCampSummary>;
}) {
  const [bucket, setBucket] = useState<"upcoming" | "past">("upcoming");
  const [types, setTypes] = useState<EventType[]>([]);
  const [audience, setAudience] = useState<EventAudienceFilter>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    let list = events.filter((e) =>
      bucket === "upcoming" ? isUpcoming(e, now) : isPast(e, now)
    );
    if (types.length > 0) list = list.filter((e) => types.includes(e.type));
    if (audience !== "all") {
      list = list.filter((e) => eventMatchesAudienceFilter(e.audience, audience));
    }
    return list.sort((a, b) => {
      const ta = +new Date(a.startDate);
      const tb = +new Date(b.startDate);
      return bucket === "upcoming" ? ta - tb : tb - ta;
    });
  }, [events, bucket, types, audience]);

  const toggleType = (t: EventType) =>
    setTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const upcomingCount = events.filter((e) => isUpcoming(e)).length;
  const pastCount = events.length - upcomingCount;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <button
          onClick={() => setBucket("upcoming")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            bucket === "upcoming"
              ? "bg-forest text-paper"
              : "border border-line text-ink-soft hover:bg-paper-deep"
          }`}
        >
          Upcoming · {upcomingCount}
        </button>
        <button
          onClick={() => setBucket("past")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            bucket === "past"
              ? "bg-forest text-paper"
              : "border border-line text-ink-soft hover:bg-paper-deep"
          }`}
        >
          Past · {pastCount}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Type</span>
        {typeOptions.map((t) => (
          <button
            key={t.value}
            onClick={() => toggleType(t.value)}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
              types.includes(t.value)
                ? "border border-pine bg-pine text-paper"
                : "border border-line text-ink-soft hover:border-pine"
            }`}
          >
            {t.label}
          </button>
        ))}
        {types.length > 0 && (
          <button
            onClick={() => setTypes([])}
            className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Audience</span>
        <button
          onClick={() => setAudience("all")}
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
            audience === "all"
              ? "border border-pine bg-pine text-paper"
              : "border border-line text-ink-soft hover:border-pine"
          }`}
        >
          All
        </button>
        {EVENT_AUDIENCE_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAudience(opt.value)}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
              audience === opt.value
                ? "border border-pine bg-pine text-paper"
                : "border border-line text-ink-soft hover:border-pine"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 border border-dashed border-line p-12 text-center text-ink-soft">
          <div className="font-display text-2xl text-ink">Nothing here yet.</div>
          <p className="mt-2 text-sm">
            No events match these filters. Clear them or check the other bucket.
          </p>
        </div>
      ) : (
        <div className="mt-12">
          <EventGrid events={filtered} linkedCampsBySlug={linkedCampsBySlug} />
        </div>
      )}
    </div>
  );
}
