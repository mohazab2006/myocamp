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
