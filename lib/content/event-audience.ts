import type { AudienceTag } from "@/lib/types";

export type EventAudienceFilter = "all" | "brothers" | "sisters";

export const EVENT_AUDIENCE_OPTIONS = [
  { value: "brothers" as const, label: "Brothers" },
  { value: "sisters" as const, label: "Sisters" },
  { value: "all" as const, label: "All" }
] as const;

export type EventAudienceTag = (typeof EVENT_AUDIENCE_OPTIONS)[number]["value"];

const EVENT_TAGS: EventAudienceTag[] = ["brothers", "sisters", "all"];
const LEGACY_TAGS: AudienceTag[] = ["youth", "parents", "families", "leaders"];

export function isEventAudienceTag(tag: string): tag is EventAudienceTag {
  return EVENT_TAGS.includes(tag as EventAudienceTag);
}

/** Primary audience for display (first brothers/sisters/all on the event). */
export function primaryEventAudience(audience: AudienceTag[]): EventAudienceTag {
  if (audience.includes("all")) return "all";
  if (audience.includes("brothers")) return "brothers";
  if (audience.includes("sisters")) return "sisters";
  return "all";
}

export function formatEventAudience(audience: AudienceTag[]): string {
  const tag = primaryEventAudience(audience);
  return EVENT_AUDIENCE_OPTIONS.find((o) => o.value === tag)?.label ?? "All";
}

export function eventMatchesAudienceFilter(
  audience: AudienceTag[],
  filter: EventAudienceFilter
): boolean {
  if (filter === "all") return true;
  if (audience.includes("all")) return true;
  if (filter === "brothers") return audience.includes("brothers");
  if (filter === "sisters") return audience.includes("sisters");
  // Legacy tags (youth, etc.) — show only when filter is "all"
  if (audience.some((tag) => LEGACY_TAGS.includes(tag))) return false;
  return false;
}
