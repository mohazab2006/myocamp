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
- Container: `max-w-[1320px] mx-auto px-6 md:px-10`.
- Grid-based (`grid grid-cols-12 gap-6 md:gap-8`) with asymmetric column spans, never identical card rows.
- Hero: split (left copy 6 cols, right cinematic photo 6 cols, photo bleeds slightly off canvas at top).
- Sections: alternating left-aligned and asymmetric. No center-stacked feature blocks.
- Bento program preview: 1 wide + 2 tall + 1 wide (4 tiles, mixed aspect).

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
