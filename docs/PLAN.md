# MYO Redesign — Master Plan

Source of truth for direction, scope, and phase ordering. Update this file as decisions evolve.

## Goal
Replace the legacy myo.camp v1 site with a two-section experience:

1. **Main MYO** at `/` — the parent organization. Editorial, photo-led, polished. Audiences: parents, donors, volunteers, community partners. Hosts events, programs, support, about, contact.
2. **MYO Camp** at `/camp` — the flagship event. Immersive, illustrated, outdoor-survival-themed (knives, knots, fires, bow & arrow, trails). Audiences: campers, parents preparing for the week. Functions almost like a sub-site, but shares the URL and brand root.
3. **Admin** at `/admin` — phase 2. Owner can edit forms, links, payment URLs, images, events, programs.

## Direction (locked)
- **Aesthetic split (Design 3).** Main MYO = editorial. Camp = playful illustrated outdoors. BearHacks is *inspiration*, not a copy — no bear/bee mascots lifted, no honey logo lookalike. Original outdoor-survival visual language.
- **Hosting:** Vercel.
- **Build order:** structure + redesign first (this phase), admin/CMS second.

## Tech stack
- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS v4 (added in this phase).
- GSAP for scroll choreography on Camp section, Framer Motion–style CSS for Main.
- Phosphor icons (already to be added) replacing lucide-react where icons read as illustrative.
- `next/font/google` for typography.

## Phase plan
- **Phase 1 — Structure + redesign (current):**
  1. Docs (this dir).
  2. Tailwind v4 + tokens.
  3. Routing skeleton.
  4. Events/programs schema + mock data.
  5. Layouts and pages for Main + Camp.
  6. Stub admin route.
  7. Clean legacy HTML.
- **Phase 2 — Admin & CMS:**
  - Sanity Studio (recommended) wired to events, programs, hero images, payment links, support links, content blocks.
  - NextAuth (or Sanity-managed auth) for owner login.
  - ISR/revalidate so edits go live without redeploys.
- **Phase 3 — Polish & motion:**
  - Camp section custom illustrations (SVG, painted-edge).
  - Real photography retouch + responsive `next/image`.
  - SEO metadata, sitemap, OG images.
  - Analytics (Vercel Analytics).

## Working agreements (with self)
- After every meaningful change: update `PROGRESS.md`.
- Architectural decisions: append to `ARCHITECTURE.md`.
- Design tokens added: update `DESIGN-MAIN.md` or `DESIGN-CAMP.md`.
- Schema fields added: update `EVENTS-PROGRAMS.md`.
- New routes: update `ROUTING.md`.

## Open questions (will revisit)
- Real domain split — is `myo.camp` still the host, or move to `myo.ca` for org and `camp.myo.ca` for camp? Currently building under one domain, both at root paths.
- Real owner credentials for admin.
- Final illustration sourcing for Camp — commission or use stock SVG packs (Phosphor + custom painted accents).
