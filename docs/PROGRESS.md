# Progress Log

Append-only. Newest entries on top.

## 2026-05-06 — Phase 1 complete

Phase 1 (structure + redesign) shipped. Production build green: 28 routes, 0 type errors, 0 import errors. Build time ~10s.

**What landed:**
- `/docs` planning system: PLAN, ARCHITECTURE, DESIGN-MAIN, DESIGN-CAMP, ROUTING, EVENTS-PROGRAMS, ADMIN, CONTENT, PROGRESS.
- Tailwind v4 wired via `@tailwindcss/postcss`. Design tokens in `app/globals.css` (`@theme` block) cover both Main MYO and Camp themes. `<body data-theme>` flips the active surface set.
- Fonts: Geist (body), Fraunces (Main display), Caprasimo (Camp display, woodcut feel), Caveat (Camp script accent).
- Phosphor icons added for utility iconography. Custom hand-drawn SVG icons (compass, flame, knot, knife, bow, leaf, tent, canoe, moon, book, wave, hand, spark) live in `components/camp/Illustrations.tsx`.
- **Routing:** `(org)` route group for Main MYO, `app/camp/*` for Camp sub-site, `app/admin/*` for phase 2 stub.
  - Main MYO: `/`, `/about`, `/events`, `/events/[slug]`, `/programs`, `/programs/[slug]`, `/support`, `/contact`.
  - Camp: `/camp`, `/camp/story`, `/camp/location`, `/camp/register`, `/camp/rules`, `/camp/support`.
  - Admin: `/admin` (placeholder explaining phase 2 plan).
- **Schema + seam for CMS:** `lib/types.ts` defines `OrgEvent`, `OrgProgram`, `SiteSettings`, `CampSettings`. `lib/content/*.ts` exposes async accessors (`getEvents`, `getEvent`, `getPrograms`, `getProgram`, `getSiteSettings`, `getCampSettings`) — phase 2 swaps the bodies for Sanity GROQ queries with no page changes.
- **Filters:** Upcoming/Past + type pills on `/events`. Active/Past + audience pills on `/programs`. `lib/date.ts` handles auto-expiry (no manual archiving needed; date passes → moved to past bucket).
- **Cleanup:** removed 9 legacy `*.html` files, removed unused `components/CampExperience.tsx`, removed stray `Pictures/` dir at root (kept `public/Pictures` with all real photos intact).
- **Mock content:** 8 events (mix upcoming + past), 5 programs (mix active + past), camp settings, site settings — owner-editable through code today, through Sanity in phase 2.

**Visual verification:**
- Booted dev server, screenshot of `/` confirmed Main MYO renders the editorial Fraunces display, italic accent text, paper-cream background, brass eyebrow, and forest CTA pills as designed.
- `/camp` route confirmed routing + theme flip — `body[data-theme]="camp"` activates the warm camp palette.
- No console errors, no hydration warnings.

**Known follow-ups (not blocking phase 1):**
- The Camp wordmark hero uses individual `<span>` letters for animation — there's no semantic `<h1>` on `/camp`. Add a visually-hidden `<h1 className="sr-only">MYO Summer Camp</h1>` for accessibility/SEO before launch.
- Image optimization: `next/image` not yet adopted — using raw `<img>` for now. Worth converting on a polish pass for LCP gains.
- A few Phosphor icons referenced (`CompassRose`) on `/` — verify lighthouse pass.

**Next phase (when owner says go):**
- Sanity Studio wiring (see `docs/ADMIN.md`).
- ISR + revalidation hook from Sanity.
- Photography pass with `next/image`.
- Real owner login.

## 2026-05-06 — Phase 1 kickoff
- Created `/docs` planning system: PLAN, ARCHITECTURE, DESIGN-MAIN, DESIGN-CAMP, ROUTING, EVENTS-PROGRAMS, ADMIN, CONTENT, PROGRESS.
- Confirmed direction with owner: Design 3 (split aesthetic), Vercel, Scope (a) — structure + redesign first, admin in phase 2.
- Pre-existing repo state: single-page Camp landing (`app/page.tsx`), GSAP wired, Geist + Fraunces fonts loaded, 30+ camp photos in `public/Pictures/`. No Tailwind installed. Legacy `*.html` files unused.
- Next: install Tailwind v4, set up tokens, build routing skeleton.
