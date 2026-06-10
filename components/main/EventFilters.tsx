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

type EventCategory = "all" | "camp" | "community";

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
  const [category, setCategory] = useState<EventCategory>("all");
  const [audience, setAudience] = useState<EventAudienceFilter>("all");
  const [types, setTypes] = useState<EventType[]>([]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = events.filter((e) =>
      bucket === "upcoming" ? isUpcoming(e, now) : isPast(e, now)
    );
    if (category === "camp") list = list.filter(isCampEvent);
    if (category === "community") list = list.filter((e) => !isCampEvent(e));
    if (audience !== "all") {
      list = list.filter((e) => eventMatchesAudienceFilter(e.audience, audience));
    }
    if (types.length > 0) list = list.filter((e) => types.includes(e.type));
    return list.sort((a, b) => {
      const ta = +new Date(a.startDate);
      const tb = +new Date(b.startDate);
      return bucket === "upcoming" ? ta - tb : tb - ta;
    });
  }, [events, bucket, category, audience, types]);

  const campEvents = filtered.filter(isCampEvent);
  const communityEvents = filtered.filter((e) => !isCampEvent(e));

  const toggleType = (t: EventType) =>
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const upcomingCount = events.filter((e) => isUpcoming(e)).length;
  const pastCount = events.length - upcomingCount;
  const campCount = events.filter((e) => isUpcoming(e) && isCampEvent(e)).length;
  const communityCount = events.filter((e) => isUpcoming(e) && !isCampEvent(e)).length;

  const showSplit = category === "all" && campEvents.length > 0 && communityEvents.length > 0;

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
        <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Show</span>
        {(
          [
            { value: "all" as const, label: "Everything" },
            { value: "camp" as const, label: `Camp sessions · ${campCount}` },
            { value: "community" as const, label: `Community events · ${communityCount}` }
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCategory(opt.value)}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
              category === opt.value
                ? "border border-pine bg-pine text-paper"
                : "border border-line text-ink-soft hover:border-pine"
            }`}
          >
            {opt.label}
          </button>
        ))}
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

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        {typeOptions.map((t) => {
          const active = types.includes(t.value);
          return (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] transition ${
                active
                  ? "border-pine bg-pine text-paper"
                  : "border-line text-ink-soft hover:border-pine"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        {types.length > 0 && (
          <button
            onClick={() => setTypes([])}
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink-soft hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 border border-dashed border-line p-12 text-center text-ink-soft">
          <div className="font-display text-2xl text-ink">Nothing here yet.</div>
          <p className="mt-2 text-sm">
            No events match these filters. Clear them or check the other bucket.
          </p>
        </div>
      ) : showSplit ? (
        <div className="mt-12 space-y-16">
          <div>
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.18em] text-brass">Summer camp</div>
              <h2 className="font-display mt-2 text-3xl tracking-tight text-ink">Camp sessions</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Multi-day camp tracks — linked to online registration, payments, and waitlists.
              </p>
            </div>
            <div className="mt-8">
              <EventGrid events={campEvents} linkedCampsBySlug={linkedCampsBySlug} />
            </div>
          </div>

          <div>
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.18em] text-brass">Everything else</div>
              <h2 className="font-display mt-2 text-3xl tracking-tight text-ink">Community events</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Bonfires, hikes, fundraisers, and one-off gatherings — each with its own sign-up link.
              </p>
            </div>
            <div className="mt-8">
              <EventGrid events={communityEvents} linkedCampsBySlug={linkedCampsBySlug} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          {category === "camp" ? (
            <p className="mb-8 max-w-2xl text-sm text-ink-soft">
              Camp session event pages — each one connects to a camp registration form.
            </p>
          ) : null}
          {category === "community" ? (
            <p className="mb-8 max-w-2xl text-sm text-ink-soft">
              Regular MYO events — bonfires, hikes, service days, and socials.
            </p>
          ) : null}
          <EventGrid events={filtered} linkedCampsBySlug={linkedCampsBySlug} />
        </div>
      )}
    </div>
  );
}
