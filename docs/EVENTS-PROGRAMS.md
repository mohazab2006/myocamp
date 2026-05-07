# Events & Programs Schema

Both share a common pattern (timed item with audience, location, slug). Programs are typically *recurring* (weekly halaqa, mentorship cohort), events are *single-occurrence* (hike, fundraiser, camp itself).

## TypeScript types (phase 1, in `lib/types.ts`)

```ts
export type AudienceTag = "youth" | "parents" | "families" | "leaders" | "all";
export type EventType = "hike" | "campfire" | "fundraiser" | "social" | "service" | "camp" | "workshop";
export type ProgramType = "weekly" | "cohort" | "drop-in" | "mentorship";

export interface OrgEvent {
  slug: string;
  title: string;
  type: EventType;
  startDate: string;       // ISO. Required.
  endDate?: string;        // optional for single-day
  location: string;
  audience: AudienceTag[];
  blurb: string;           // 1-2 sentence card copy
  body?: string;           // markdown for detail page
  heroImage?: string;      // /Pictures/...
  registerUrl?: string;
  registerOpens?: string;  // ISO
  registerCloses?: string; // ISO
  cost?: string;           // "$25" or "Free"
  archived?: boolean;      // manually hide from upcoming even if future
}

export interface OrgProgram {
  slug: string;
  title: string;
  type: ProgramType;
  cadence: string;         // "Every Friday, 7pm" — display string
  audience: AudienceTag[];
  blurb: string;
  body?: string;
  heroImage?: string;
  signupUrl?: string;
  active: boolean;         // soft-archive flag, replaces date filtering
  startedAt?: string;      // ISO, used for sorting newest first
}
```

## Filter logic

### Events
- `upcoming`: `endDate ?? startDate >= today` AND `!archived`.
- `past`: `endDate ?? startDate < today` OR `archived`. Sorted newest first.
- Filter UI: pills for `Upcoming` / `Past`, plus type tag pills (multi-select, OR within type).

### Programs
- `active === true` → "Currently running".
- `active === false` → "Past programs". Sorted by `startedAt` desc.
- Filter UI: `Active` / `Past`, plus audience pills.

## Helper module (`lib/date.ts`)

```ts
export const isUpcoming = (e: OrgEvent, now = new Date()) =>
  !e.archived && new Date(e.endDate ?? e.startDate) >= now;

export const isPast = (e: OrgEvent, now = new Date()) => !isUpcoming(e, now);

export const formatRange = (start: string, end?: string) => {/* … */};
```

## Auto-expiry behavior
- A program/event is **never deleted**; it moves to the "Past" bucket automatically when its date passes.
- Owner can manually `archived: true` to push something out of Upcoming early.
- In phase 2 admin, the dashboard shows three buckets: Upcoming, Live now, Past — all editable.

## Mock data location (phase 1)
- `lib/content/events.ts` — array of `OrgEvent`.
- `lib/content/programs.ts` — array of `OrgProgram`.
- These get replaced by Sanity queries in phase 2 with no signature change.
