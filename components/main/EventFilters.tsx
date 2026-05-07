"use client";

import { useMemo, useState } from "react";
import type { EventType, OrgEvent } from "@/lib/types";
import { isPast, isUpcoming } from "@/lib/date";
import { EventCard } from "./EventCard";

const typeOptions: { value: EventType; label: string }[] = [
  { value: "hike", label: "Hike" },
  { value: "campfire", label: "Campfire" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "social", label: "Social" },
  { value: "service", label: "Service" },
  { value: "camp", label: "Camp" },
  { value: "workshop", label: "Workshop" }
];

export function EventFilters({ events }: { events: OrgEvent[] }) {
  const [bucket, setBucket] = useState<"upcoming" | "past">("upcoming");
  const [types, setTypes] = useState<EventType[]>([]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = events.filter((e) =>
      bucket === "upcoming" ? isUpcoming(e, now) : isPast(e, now)
    );
    if (types.length > 0) list = list.filter((e) => types.includes(e.type));
    return list.sort((a, b) => {
      const ta = +new Date(a.startDate);
      const tb = +new Date(b.startDate);
      return bucket === "upcoming" ? ta - tb : tb - ta;
    });
  }, [events, bucket, types]);

  const toggleType = (t: EventType) =>
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

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

        <span className="ml-auto hidden text-xs uppercase tracking-[0.16em] text-ink-soft md:inline">
          Filter by type
        </span>
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
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
