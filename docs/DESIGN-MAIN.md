# Design — Main MYO (`/`, /events, /programs, /support, /about, /contact)

## Mood
Editorial outdoor magazine. Quiet, grown-up, photo-led, trustworthy enough for parents and donors but with enough texture and warmth that it doesn't read as corporate.

Reference vibe: Sidetracked Magazine, Field Mag, Patagonia long-form, Outside Online editorial. Anti-references: generic SaaS, university bursar pages, summer-camp clip art.

## Palette
| Token | Value | Use |
|-|-|-|
| `--ink` | `#1d2520` | Body text, headings |
| `--ink-soft` | `#3a443d` | Secondary text |
| `--paper` | `#f3eee3` | Page background |
| `--paper-deep` | `#e8e0cd` | Section accents, cards |
| `--forest` | `#1f3a2c` | Primary surface accent, dark sections |
| `--pine` | `#2c5142` | Hover, links |
| `--brass` | `#9c7a3c` | Inline accent, dividers |
| `--ember` | `#b34a2a` | CTAs, sparingly |
| `--sky` | `#dbe6e0` | Soft surface |

Saturation kept under 70%. No pure black. No pure white. Single accent (`ember`) per page max.

## Typography
- **Display (`--font-display`)**: Fraunces. Variable, slightly soft. `text-5xl md:text-7xl`, `tracking-tight`, `leading-[0.95]`. Used for hero h1, section h2.
- **Body (`--font-sans`)**: Geist. `text-base leading-relaxed`. Body text caps at `max-w-[62ch]`.
- **Eyebrow**: Geist, `text-xs uppercase tracking-[0.18em]`, brass color.

No script font. No Inter. No oversize headlines beyond 7xl.

## Layout
- Container: `max-w-[1440px] mx-auto px-6 md:px-10`.
- Grid-based with asymmetric column spans, never identical card rows.
- **Hero (updated 2026-05-07):** image-led wordmark hero, mirroring `/camp` energy but editorial.
  - Top row: small editorial labels (org name · era) left + right.
  - Center: massive "MYO" Fraunces wordmark, `clamp(140px, 28vw, 360px)`, letter-spacing `-0.04em`. Animated letter-drop on load via GSAP.
  - Below wordmark: italic Fraunces "Muslim Youth of Ottawa" as the tagline.
  - The actual MYO Summer Camp logo image (`/Pictures/Logo.png`) is rendered below the tagline with `mix-blend-multiply` so it sits on the paper texture as a brand artifact, not as a UI chrome element.
  - Three numbered meta tiles (years / programs / volunteer-led), thin-rule dividers above each.
  - Two CTAs: primary "What's coming up" → events, secondary "The Summer Camp" → /camp.
  - Below CTAs: a 4-up photo strip of activity imagery (assembly, canoes, sports, fire pit) with alternating Y offsets, captioned in micro-caps.
- Sections: image-led blocks. Three-pillar tile row (Events / Programs / Camp), full-bleed photo strip with no copy, image-led event cards, photo collage on support band.
- Copy length: hero tagline = one line. Section intros ≤ 1 sentence. Card meta ≤ 1 line.

## Motion (intensity 4, intentional)
- Section entrances: fade + 12px rise, staggered 80ms, on intersection.
- Image scroll: subtle scale 1.0 → 1.04 over viewport pass.
- No page transitions. No mouse-trailing effects. No magnetic buttons.
- Respect `prefers-reduced-motion`.

## Components
- **CTA button** — primary: `bg-forest text-paper`, hover lifts 1px, no glow. Secondary: outlined `border-ink/20`.
- **Photo card** — image at top, 4:3 default. Caption underneath, no card chrome.
- **Pill filter** — used on events/programs. Active state: filled forest.
- **Inline meta row** — date, location, audience, separated by `·` middle dot.
- **Footer** — full-width forest band, paper-color text, 3-column on desktop.

## Photography rules
- Real camp photos only, no staged stock.
- No filter that crushes the warm tones already present.
- No rounded-full crops; allow tall and wide rectangles.
- Captions optional but should explain context, not just label.
