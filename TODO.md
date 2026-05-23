# MYO Camp — TODO

## Pre-launch QA

- [ ] **Verify OG / social link preview works**
  - [ ] Live site `https://myo.camp` returns 200 (currently confirmed 500 on 2026-05-11 — re-check after Vercel redeploy)
  - [ ] View source on `https://myo.camp` and confirm presence of:
    - `<meta property="og:image" content="https://myo.camp/Pictures/og-image.png">`
    - `<meta property="og:image:width" content="1200">`
    - `<meta property="og:image:height" content="630">`
    - `<meta name="twitter:card" content="summary_large_image">`
    - `<meta name="twitter:image" content="https://myo.camp/Pictures/og-image.png">`
  - [ ] Direct-load `https://myo.camp/Pictures/og-image.png` in browser → image renders, 1200×630
  - [ ] Force-refresh social caches:
    - [ ] Facebook / Messenger / WhatsApp — https://developers.facebook.com/tools/debug/ → Scrape Again
    - [ ] LinkedIn — https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fmyo.camp
    - [ ] X / Twitter — paste URL in DM to self, confirm large image card
    - [ ] Discord — paste URL in test channel
    - [ ] iMessage — text URL to self
  - [ ] Repeat preview check for key sub-routes: `/camp`, `/camp/register`, `/blog`, `/events`

- [ ] **Admin page is solid**
  - [ ] `/admin` loads without errors on production
  - [ ] Auth gate works (unauthed users blocked / redirected)
  - [ ] All admin actions tested end-to-end (create / read / update / delete on each model)
  - [ ] Form validation + error states render correctly
  - [ ] Mobile layout usable (admin often desktop-first — verify at minimum it doesn't break)
  - [ ] Confirm no admin routes/data leak via crawler (e.g. `robots.txt`, no admin links in sitemap)
  - [ ] Loading + empty states present on every list/table
  - [ ] Audit Vercel runtime logs for any 500s coming from `/admin/*`

- [ ] **Overall site QA**
  - [ ] Every page in the route list renders 200 on production:
    - [ ] `/`, `/about`, `/contact`, `/support`
    - [ ] `/camp`, `/camp/location`, `/camp/register`, `/camp/rules`, `/camp/story`, `/camp/support`
    - [ ] `/events`, all `/events/[slug]` entries
    - [ ] `/blog`, all `/blog/[slug]` entries
  - [ ] No 404s on internal links — run a link checker (e.g. `npx broken-link-checker https://myo.camp -r`)
  - [ ] Mobile responsiveness pass on iPhone SE, iPhone 14 Pro, Pixel, iPad
  - [ ] Lighthouse audit (Performance, Accessibility, Best Practices, SEO) — target ≥ 90 each
  - [ ] Images: all have `alt` text, all sized correctly (no CLS), all served via `next/image` where applicable
  - [ ] Forms submit successfully (registration, contact, support, etc.)
  - [ ] Confirm Camp Smitty registration flow end-to-end with a test record
  - [ ] Fonts load (no FOUT/FOIT) across Geist / Fraunces / Caprasimo / Caveat
  - [ ] Dark/light + theme tokens consistent across pages
  - [ ] Sitemap + robots.txt exist and are correct
  - [ ] Favicons render in browser tab + bookmarks + iOS "Add to Home Screen"
  - [ ] 404 page is on-brand and helpful
  - [ ] No console errors / warnings on any page
  - [ ] Cross-browser: Chrome, Safari (desktop + iOS), Firefox, Edge
  - [ ] Spell-check / proofread all visible copy
  - [ ] Verify all external links open in new tab where appropriate

## Follow-ups

- [ ] **Ask Mahfouthi** what he wants added or changed
  - Send him the staging/production URL once OG + admin + QA are green
  - Capture his feedback in this file under a new "Mahfouthi feedback" section
  - Triage feedback into: (a) must-fix before launch, (b) v1.1, (c) won't-do

## Mahfouthi feedback

_(to be filled in after review session)_
