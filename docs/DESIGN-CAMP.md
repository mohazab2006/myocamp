# Design — MYO Camp (`/camp`)

## Mood
A field journal you'd find in a cabin. Hand-drawn, painted edges, slightly weathered paper, warm fire-lit palette. Survival skills as visual language: knots, fire-starters, knives, compass, bow & arrow, topo lines, trail markers.

This is **not** BearHacks. We borrow the *energy* (illustrated, playful, confident) and *texture* (warm paper, painted display type) but build our own visual world around camp survival craft, not honey/bears.

Reference vibe: vintage REI catalogues, Boy/Girl Scout handbooks, Sibley field guides, Wes Anderson outdoor (Moonrise Kingdom production design). Anti-references: cartoony Disney mascots, kid-camp clip-art clouds, Comic Sans.

## Palette
| Token | Value | Use |
|-|-|-|
| `--camp-paper` | `#f4ead3` | Page background, slight grain |
| `--camp-paper-soft` | `#e9dcb6` | Cards, callouts |
| `--camp-ink` | `#241a0f` | Body type, line-art |
| `--camp-bark` | `#5a3a1f` | Headings, secondary |
| `--camp-moss` | `#3a5236` | Tags, paths |
| `--camp-flame` | `#c8501e` | CTA, accents, fire-sparks |
| `--camp-amber` | `#d6962b` | Highlights |
| `--camp-sky` | `#aec8c5` | Sky panels behind hero illustration |

Saturation pushed higher than Main (camp is allowed to feel painted). Still no neon or pure black.

## Typography
- **Display**: Caprasimo (Google). Chunky woodcut serif, paint-bucket feel. `text-6xl md:text-[10vw]`, `tracking-tight`, used as the wordmark and section openers. Falls back to Fraunces.
- **Sub-display**: Caveat. Hand-script, used for *labels only* — "Trailhead", "Before you arrive", numbered ticks. Never running text.
- **Body**: Geist. Same as Main, keeps it readable. Caps at `max-w-[60ch]`.

Hierarchy is created by *contrast in style*, not size — a chunky Caprasimo word against thin Geist paragraphs is the look.

## Layout
- Container is wider and breathier than Main: `max-w-[1440px] mx-auto`.
- Hero: full-bleed paper background with hand-drawn topo lines (SVG) and a wordmark composed of layered Caprasimo + an illustrated accent (small compass, knot, or arrow).
- Sections separated by **painted dividers** — irregular SVG strokes, not flat hr lines.
- Decorative SVG icons (knot, fire, knife, bow, compass, leaf) anchor each section. All custom SVG, hand-feel, single stroke weight 1.5px.
- Grid uses fractional spans (`2fr 1fr 1.5fr`) — never equal columns.
- Camp days / packing list / rules use **field journal blocks**: bordered with hand-drawn-style dashed lines, slightly rotated tape decorations.

## Motion (intensity 7, expressive)
- Hero wordmark assembles on load — letters drop in with spring physics, accents fade in last.
- Scroll: parallax on illustrated layers (sky → trees → foreground). Topo lines redraw.
- Section reveals: hand-drawn underline strokes animate in on first view.
- Hover on day cards: slight wobble + shadow drop, like lifting a postcard.
- All GSAP, isolated to client components. Respects `prefers-reduced-motion`.

## Components
- **Field card** — paper texture, 2px painted border, optional rotated "tape" corner accent. Used for activities, days, rules.
- **Topo divider** — SVG horizontal contour line. Section break.
- **Skill tag** — pill with hand-drawn icon (knot, knife, compass) + label. Used for activity filtering.
- **Wordmark block** — hero composition with layered display word + illustrated accent.
- **CTA button** — solid flame fill, paper text, 2px ink border, hover tilt.

## Asset plan
- All SVG illustrations live in `public/illustrations/`.
- Custom built (not stock) — start with simple line-art compass, knot (overhand + figure-8), flame, knife (folding pocket), bow & arrow, leaf, topo line. Strokes 1.5px, ink color, on transparent.
- Real photos from `public/Pictures/` get a **painted-edge mask** overlay for the camp section to unify them with the illustrated style.

## What we will NOT do
- No bears, bees, honey jars, honey lettering. (BearHacks territory.)
- No emoji. No clip-art tents. No comic-style speech bubbles.
- No drop-shadow text glow.
- No purple. No gradient backgrounds bigger than a button.
