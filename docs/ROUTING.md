# Routing Map

Single Next.js App Router project. Two sibling segments (`/`, `/camp`) carry different layouts so design languages can fully diverge.

## Public routes

### Main MYO (org)
| Path | Purpose | Status |
|-|-|-|
| `/` | Org landing — mission, events teaser, programs teaser, camp teaser, support CTA | TODO |
| `/about` | About MYO, history, leadership, values | TODO |
| `/events` | All events, with filter (upcoming/past, type tag) | TODO |
| `/events/[slug]` | Single event detail (date, location, register link, gallery) | TODO |
| `/programs` | All programs, with filter (active/archived, audience) | TODO |
| `/programs/[slug]` | Single program detail | TODO |
| `/support` | Donate, volunteer, sponsor | TODO |
| `/contact` | Email, address, social links | TODO |

### Camp (sub-site)
| Path | Purpose | Status |
|-|-|-|
| `/camp` | Camp landing — illustrated hero, week overview, activities, register CTA | TODO |
| `/camp/story` | What camp is, philosophy, who runs it | TODO |
| `/camp/location` | Camp Smitty info, map, drop-off/pickup logistics | TODO |
| `/camp/register` | Registration intro + embedded JotForm + pricing | TODO |
| `/camp/rules` | Code of conduct, packing list, what to leave home | TODO |
| `/camp/support` | Donate to subsidize campers, volunteer staff | TODO |

### Admin (phase 2 — stubbed in phase 1)
| Path | Purpose | Status |
|-|-|-|
| `/admin` | Owner login + content dashboard | Phase 2 — phase 1 shows placeholder |
| `/admin/events` | CRUD events | Phase 2 |
| `/admin/programs` | CRUD programs | Phase 2 |
| `/admin/site` | Edit hero photos, payment URLs, support links | Phase 2 |

## Layout boundaries
- `app/layout.tsx` — root: fonts, html lang, body, analytics. No nav.
- `app/(org)/layout.tsx` (or just bare `app/`) — Main MYO nav, footer, body theme `org`.
- `app/camp/layout.tsx` — Camp nav, footer, body theme `camp`, GSAP plugin registration.
- `app/admin/layout.tsx` — admin chrome (phase 2).

## Navigation contracts
- **Main MYO nav**: About · Events · Programs · Camp → · Support · Contact.
  - The "Camp" link sends users into the sub-site; visually distinct (gets a small flame mark).
- **Camp nav**: ← Back to MYO · Story · Location · Register · Rules · Support.
  - Always offers escape back to org.
- Both navs render on all their respective pages, sticky, slim.
