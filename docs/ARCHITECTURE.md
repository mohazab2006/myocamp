# Architecture

## Stack
- **Framework:** Next.js 16 App Router, React 19, TypeScript strict.
- **Styling:** Tailwind v4 (`@tailwindcss/postcss`) + CSS variables for design tokens. Custom CSS only for textured surfaces (paper, ink, painted edges) where Tailwind utilities aren't expressive enough.
- **Animation:** GSAP + ScrollTrigger (Camp section, scroll choreography). Tailwind transitions + CSS keyframes (Main section).
- **Icons:** `@phosphor-icons/react` for the Camp playful set; `lucide-react` retained for utility/admin UI.
- **Fonts:**
  - `Geist` — body, UI, navigation (both sections).
  - `Fraunces` — Main editorial display.
  - `Caprasimo` (Google) — Camp display, chunky woodcut feel.
  - `Caveat` — Camp accent / handwritten labels.
- **Data:** local TypeScript modules in `lib/content/` for phase 1 (mock content). In phase 2 these get swapped for Sanity client calls.

## Directory layout (target)
```
app/
  layout.tsx                Shared root: fonts, providers, both nav contexts via segment
  globals.css               Tokens + base reset + texture utilities
  page.tsx                  / Main MYO landing
  about/page.tsx
  events/page.tsx           List with filter
  events/[slug]/page.tsx
  programs/page.tsx
  programs/[slug]/page.tsx
  support/page.tsx
  contact/page.tsx
  camp/
    layout.tsx              Camp-only nav, themed body class, GSAP shell
    page.tsx                Camp landing
    story/page.tsx
    location/page.tsx
    register/page.tsx
    rules/page.tsx
    support/page.tsx
  admin/
    page.tsx                Phase 1 stub: "coming soon, owner login"
components/
  main/                     Main MYO components (editorial)
  camp/                     Camp components (illustrated)
  shared/                   Buttons, links, layout primitives, footer
lib/
  content/
    events.ts               Mock events
    programs.ts             Mock programs
    camp.ts                 Camp copy
    org.ts                  Org copy, support links, payment URLs
  date.ts                   isUpcoming / isPast helpers
  types.ts
public/
  Pictures/                 Existing camp photography (preserved)
  illustrations/            Camp-section SVG accents (added this phase)
docs/
  *.md                      This planning system
```

## Routing decisions
- **Single Next app, two segment groups** (no separate sub-domain in phase 1). The `/camp` segment carries its own `layout.tsx` so the design language can fully diverge (different background, fonts loaded, nav).
- **Middleware-free**: the segment boundary handles theming, no runtime logic needed.
- Body has a `data-theme="org" | "camp"` attribute set by each layout, used to scope CSS variables.

## Data flow (phase 1 → phase 2)
Phase 1: pages import directly from `lib/content/*.ts`.
Phase 2: replace the body of those files with Sanity GROQ queries. Page components stay identical because the function signatures match. This is the seam.

```ts
// phase 1
export async function getEvents(): Promise<Event[]> { return seedEvents; }
// phase 2
export async function getEvents() { return sanityClient.fetch(QUERY_EVENTS); }
```

## Hosting
- Vercel. `next start` not needed; Vercel runs Next directly.
- `next/image` configured (no remote hosts in phase 1; images served from `public/`).
- Edge runtime not used in phase 1 (keeps GSAP comfortable).
