# Progress Log

Append-only. Newest entries on top.

## 2026-05-11 — Corrected file references, removed main camp from events, added proper MYO logo

Two issues from owner review:
1. **MYO Summer Camp · Main Session was on the events list.** That's the camp itself, not an event. Pulled it. The LIT session stays as an event (it's a focused 4-day leadership track that pre-dates the main camp — reads as an event, not the whole camp identity). Retitled to "LIT Leadership Track 2026" and changed `type` from `camp` to `workshop` so it filters under the workshop chip rather than the camp chip.
2. **Images weren't showing.** Owner saved files with different casing/naming than what I'd specced. Audited and corrected:
   - `lit-group.jpg` → `kidswiththobes.JPG` (thobes group)
   - `lit-night.jpg` → `LITgroup.JPG` (LIT at night)
   - `racers-group.jpg` → `racersgroup.jpg`
   - `basketball.jpg` was already correct
   Updated all references across `OrgHero.tsx`, `app/(org)/page.tsx`, `lib/content/programs.ts`, `lib/content/events.ts`. **Important:** Vercel is case-sensitive — references must match exact case. Logged in CONTENT.md.

**Bonus assets owner added (used right away):**
- `LogoMAIN.png` — the **proper** MYO standalone circular badge (no "Summer Camp" wordmark). Replaces `Logo.png` in the org nav and hero. Applied CSS `filter` chain to recolour the pale-blue line art into deep forest green so it reads on the paper background. Old `Logo.png` (camp-branded) retained in repo for now but no longer referenced from org pages.
- `verycoolcampfire.jpg` — long-exposure campfire-sparks shot with silhouette. Dropped into the camp band 4-up collage as the headline tile (was `basketball.jpg`).

Build verified green.

## 2026-05-07 — Added 4 owner-provided modern photos (people-heavy hi-res)

Owner sent four hi-res modern photos to replace the dominant use of vintage camp1–7 thumbnails. Filenames (chosen by me, owner saves the files into `public/Pictures/`):
- `basketball.jpg` — three boys mid-game, arms outstretched, ball flying. Energy shot.
- `lit-group.jpg` — LIT cohort in thobes, posed at Camp Smitty cabins for Jumu'ah. Iconic identity shot.
- `lit-night.jpg` — LIT group around a truck at night, candid.
- `racers-group.jpg` — younger campers with a hand-made "RACERS" banner, outdoor games day.

Deployed across the home page:
- **Hero background wash:** `camp1` → `basketball` (heavy fade, energy).
- **Hero 4-up tiles:** all replaced with new photos — `basketball, lit-group, racers-group, lit-night`. Captions rewritten.
- **Pillar tiles:** Events → `racers-group`, Programs → `lit-group`, Camp → `camp7` (kept; lake-swim joy still strongest camp signature).
- **Photo strip (7 wide):** mixed new + classics → `basketball, lit-group, racers-group, camp7, camp2, camp6, lit-night`.
- **Camp band 4-up collage:** swapped to `basketball, camp7, racers-group, camp2`.
- **Support band 3-up collage:** swapped to `lit-group` (the big banner image), `basketball`, `racers-group`.
- **Program seed `heroImage` updates:** LIT Mentorship → `lit-group`, Brothers' Basketball League → `basketball`.

These flow through to the events/programs detail pages, listings, and home-page program cards automatically. Existing camp1–7 photos remain in rotation on the photo strip and other supporting spots.

Note logged in `docs/CONTENT.md` so the file inventory is current.

## 2026-05-07 — Photo audit: replaced scenery shots with people/kids

**Owner feedback:** the home page was image-heavy but the images were of *stuff* (volleyball nets, empty fire pits, cabin interiors, parked canoes) — not kids playing and having fun.

Audit of `public/Pictures/`:
- **Has people (use these):** `camp1.jpg` (group at outdoor tables, mid-90s assembly), `camp2.jpg` (boy on raft + canoes in distance), `camp3.jpg` (cabin social, group of teens laughing), `camp4.jpg` ("Long Bay Camp 1997" group photo), `camp5.jpg` (two boys with pillows, candid), `camp6.jpg` (kids apple-bobbing in tubs), `camp7.jpg` (kids in life-jackets splashing in lake — pure joy shot).
- **Scenery only (avoid for hero use):** `sports.jpg` (empty volleyball net), `assembly.jpg` (empty field), `obstacleCourse.jpg` (empty rope course in woods), all cabin shots, all fire-pit shots, all trails / waterfront landscape shots.

Swapped throughout home page:
- `OrgHero` background wash: `trails.jpg` → `camp1.jpg` (faded group shot).
- `OrgHero` 4-up photo tiles: scenery shots → `camp7, camp1, camp6, camp3`. Captions updated to match action.
- Three pillar tiles (Events / Programs / Camp): `assembly, library, canoes2` → `camp1, camp3, camp7`.
- Full-bleed photo strip: 8 scenery shots → 7 people shots (`camp7, camp2, camp1, camp6, camp4, camp5, camp3`). Grid changed to `grid-cols-2 md:grid-cols-7`.
- Camp band 4-up collage: `bFirePit, canoes, trails, insideBCabin` → `camp7, camp2, camp4, camp6`.
- Support band 3-up collage: `assembly, coffeeStation, sports` → `camp7, camp1, camp4`.
- Program seed `heroImage` fields: scenery shots → `camp3, camp4, camp2, camp6, camp5` (so program cards on home + listings show people).

The camp1–7 photos are lower-resolution vintage shots — which actually reinforces the "since the 1980s" framing rather than hurting it. Reads as historical authenticity, not pixelation.

## 2026-05-07 — Home page redesign (image-led) + real event added

**Owner feedback on Main MYO landing:** too wordy, not enough images, hero weak, wanted to use the MYO logo.

Resolved:
- Built `components/main/OrgHero.tsx` — new wordmark-style hero that mirrors `/camp` hero energy but stays editorial. Massive Fraunces "MYO" (`clamp(140px, 28vw, 360px)`), italic Fraunces tagline below, then the real `/Pictures/Logo.png` rendered as a brand artifact via `mix-blend-multiply` on paper. Three meta tiles (40+ years · 12 events/year · 100% volunteer), two CTAs, then a 4-up photo strip with offset rhythm. GSAP letter-drop + stagger on load.
- Added screen-reader-only `<h1>MYO</h1>` for accessibility — wordmark is visual.
- Rewrote `app/(org)/page.tsx`:
  - Removed text-heavy "What MYO does" 4-icon grid.
  - Added three image-led pillar tiles (Events / Programs / Camp) with cover photos + caption overlays.
  - Added full-bleed 8-up photo strip (`sports, canoes, obstacleCourse, artsAndCrafts, trails, gFirePit, lego, messHall`) — visual storytelling, zero copy.
  - Trimmed event teaser intro and section headlines to one short line each.
  - Compressed camp band — shorter copy, kept photo collage.
  - Rebuilt programs preview as image cards (was a text list).
  - Compressed support band to a photo collage + one-line pitch.
  - Removed the trailing quick-contact row entirely (was redundant with footer).

**Content updates (real, not mock):**
- Added MSA Bonfire Social event (May 16, 2026 · Rideau River Provincial Park · free w/ registration · hosted by AYJ MSA · workshops by MYO) to `lib/content/events.ts`. Real Google Forms registration URL wired up.
- Updated camp event entries to reflect the new dual-session format the owner confirmed: LIT session Jul 23–26 and Main Camp Aug 6–9 (both 4 days). Older single-week placeholder replaced.

**Docs updated:**
- `docs/ADMIN.md` — added "UX inspiration: @salamsociety repo" for phase 2, plus full owner brief on new camp dual-session structure, optional October archery weekend, day-camp / meetup possibilities, and explicit list of things owner wants editable.
- `docs/DESIGN-MAIN.md` — replaced old hero spec with the new wordmark-led version.

**Not touched (per owner instruction):**
- `/camp` page design, layout, components — left as-is.
- Camp section content (`lib/content/camp.ts`) — still reflects single-week structure. Phase 2 admin will let owner update to dual-session format himself. Flagged in `docs/ADMIN.md`.

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
