"use client";

import { useMemo, useState } from "react";
import type { AudienceTag, OrgProgram } from "@/lib/types";
import { ProgramCard } from "./ProgramCard";

const audienceOptions: { value: AudienceTag; label: string }[] = [
  { value: "youth", label: "Youth" },
  { value: "leaders", label: "Leaders" },
  { value: "families", label: "Families" },
  { value: "parents", label: "Parents" },
  { value: "all", label: "Everyone" }
];

export function ProgramFilters({ programs }: { programs: OrgProgram[] }) {
  const [bucket, setBucket] = useState<"active" | "past">("active");
  const [tags, setTags] = useState<AudienceTag[]>([]);

  const filtered = useMemo(() => {
    let list = programs.filter((p) => (bucket === "active" ? p.active : !p.active));
    if (tags.length > 0) {
      list = list.filter((p) => p.audience.some((a) => tags.includes(a)));
    }
    return list.sort(
      (a, b) => +new Date(b.startedAt ?? 0) - +new Date(a.startedAt ?? 0)
    );
  }, [programs, bucket, tags]);

  const activeCount = programs.filter((p) => p.active).length;
  const pastCount = programs.length - activeCount;

  const toggleTag = (t: AudienceTag) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <button
          onClick={() => setBucket("active")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            bucket === "active"
              ? "bg-forest text-paper"
              : "border border-line text-ink-soft hover:bg-paper-deep"
          }`}
        >
          Active · {activeCount}
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
          Filter by audience
        </span>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        {audienceOptions.map((t) => {
          const active = tags.includes(t.value);
          return (
            <button
              key={t.value}
              onClick={() => toggleTag(t.value)}
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
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 border border-dashed border-line p-12 text-center text-ink-soft">
          <div className="font-display text-2xl text-ink">Nothing here yet.</div>
          <p className="mt-2 text-sm">No programs match these filters.</p>
        </div>
      ) : (
        <ul className="mt-6">
          {filtered.map((p) => (
            <li key={p.slug}>
              <ProgramCard program={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
