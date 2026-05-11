# Admin — Phase 2 plan

Phase 1 ships a placeholder `/admin` route. This doc captures the design so phase 2 implementation is fast and the data shape in phase 1 already aligns.

## Owner needs (gathered from initial brief)
- Add / edit events and programs.
- Update payment URLs (PayPal donate ID changes occasionally).
- Update form embeds (JotForm URLs change per registration cycle).
- Swap hero/feature images.
- Toggle "Registration is open / full / closed" on camp.
- Edit copy for support, contact, rules pages.

## Recommended stack
- **Sanity Studio** embedded at `/admin` (or hosted at `myo.sanity.studio`).
  - Free tier: 3 users, 10k docs — ample.
  - Schema lives in `sanity/schemas/`.
  - Auth handled by Sanity (Google login for owner).
  - Live preview optional later.
- **Why Sanity over alternatives:**
  - Payload (great but self-hosted DB needed).
  - Notion-as-DB (cute but slow API, unstructured).
  - Sheets-as-DB (no relational fields, awkward for image refs).
  - Custom (months of work for a 2-person team).

## Schemas to ship in phase 2
- `event` — matches `OrgEvent` interface in `lib/types.ts`.
- `program` — matches `OrgProgram`.
- `siteSettings` — singleton: contact email, support links, payment IDs, social URLs.
- `campSettings` — singleton: registration status, current camp dates, JotForm URL, drop-off/pickup times, fees.
- `page` — long-form pages (about, story, rules) with portable text body.
- `mediaAsset` — image with alt, caption, credit.

## Data integration seam
Phase 1 keeps content in `lib/content/*.ts` exporting async functions:
```ts
export async function getEvents(): Promise<OrgEvent[]>;
export async function getEvent(slug: string): Promise<OrgEvent | null>;
```
Phase 2 swaps the body of those functions to call `sanityClient.fetch(...)`. **Page components do not change.** This is the deliberate seam.

## Auth
- Sanity Studio handles login.
- Public site has no auth in phase 1 or 2.
- If owner ever wants form-builder UI on the public site (low priority), use NextAuth + role check — not in scope yet.

## Revalidation
- Use Next ISR with `revalidate: 60` on listing pages once Sanity is wired.
- Add `/api/revalidate` webhook from Sanity for instant updates.

## Out of scope for admin
- Member accounts / camper logins. (JotForm + email handles registration.)
- Payment processing. (PayPal + EMT remain external.)
- Email broadcasts. (Owner uses Mailchimp separately.)

## UX inspiration
- **@salamsociety repo** — owner referenced this as visual/UX reference for the admin dashboard. Review before scaffolding Sanity Studio config; possibly worth copying the layout / IA pattern.

## Real content owner needs to be able to edit (recorded so phase 2 covers all of it)

### Camp — new dual-session format (confirmed by owner 2026-05-07)
The camp moved from one full week to **two 4-day sessions** at Camp Smitty:

- **LIT Program** (Leadership track)
  - Thursday July 23 (9am) – Sunday July 26 (3pm)
  - Staff arrive Wednesday at 6pm
  - Lighter logistics: LITs help with meals, planning, self-management
  - LITs may graduate to counsellor roles for the core camp
- **Main Camp** (Core program)
  - Thursday August 6 – Sunday August 9
  - Staff arrive Wednesday at 6pm
  - Primary staff focus

Phase 2 implication: `campSettings` singleton needs two session fields (LIT + main) rather than a single date range. The `WeekRhythm` field should support 4-day arrays. Re-evaluate fee structure with owner.

### Additional camp activities the owner is considering
- Dedicated **archery weekend** in October.
- A **day camp** or **meetups** before the main camp (continuing recent years' pattern).

### Confirmed real events
- **MSA Bonfire Social** — May 16, 2026 · Rideau River Provincial Park · ages 16+ · free w/ registration. Hosted by AYJ MSA, workshops by MYO. Registration: `https://docs.google.com/forms/d/e/1FAIpQLScKEypc02nwQOrxD4Aq_91WhoiOyIAg5Wc9eVY_J_NaAk2gNQ/viewform`. Already seeded in `lib/content/events.ts`.

### What owner explicitly wants admin control over
- Forms (registration URLs change per cycle).
- Links (donate, volunteer, social).
- Payment details (PayPal hosted button ID).
- Images (swap hero / feature images).
- Event copy + dates + statuses (open/full/closed).
- Camp settings (dates, fees, registration status, dual-session structure).
