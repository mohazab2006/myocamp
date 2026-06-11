# CLAUDE.md — MYO Camp

Quick reference for Claude Code working in this repo.

## Stack

- **Next.js 16** (App Router, server actions, `force-dynamic` where needed)
- **React 19**, TypeScript 5
- **Tailwind CSS 4** with custom design tokens (see `app/globals.css`)
- **Supabase** — Postgres + Storage (service role key for all reads/writes, RLS blocks anon)
- **pnpm** package manager
- **Vitest** for unit tests (`pnpm test`)

## Key directories

```
app/
  (org)/          Public site — home, /blog, /events
  admin/          Password-protected admin panel
  camp/           Camp-specific pages (/camp, /camp/register, etc.)
  api/            Route handlers (JotForm webhook, PayPal, cron)
components/
  admin/          Admin-only form components
  main/           Public-facing components
  camp/           Camp-specific components
lib/
  admin/          Server-only helpers (auth, media upload, guards)
  content/        Data-fetching functions (blog, events, camps, home)
  supabase/       Supabase clients (admin.ts = service role, content.ts = reader)
  types.ts        All shared TypeScript types
tests/            Vitest unit tests (pnpm test)
docs/             Project docs (SETUP.md, TODO.md, SANDBOX.md, etc.)
supabase/
  schema.sql      Full idempotent schema — run in Supabase SQL Editor
```

## Running the project

```bash
pnpm dev          # start dev server
pnpm build        # production build (catches TS errors + missing env vars)
pnpm test         # run all unit tests (vitest)
pnpm test:watch   # watch mode
```

## Environment variables

See `.env.example`. Critical ones:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — anon key for auth
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; used for all content reads/writes
- `ADMIN_EMAILS` — comma-separated email allowlist for `/admin`

Without Supabase vars, the site falls back to seed data (blog, events, camp settings).

## Admin panel (`/admin`)

| URL | Purpose |
|-----|---------|
| `/admin/blog` | Create / edit / delete blog posts |
| `/admin/blog/new` | New post — supports hero image, body with inline images, multiple links |
| `/admin/announcement` | Edit the home-page announcement banner (or disable to revert to auto camp news) |
| `/admin/events` | Manage events with registration URLs |
| `/admin/camps` | Manage camp sessions, JotForm IDs, capacity, status |
| `/admin/inbox` | Match inbound e-Transfer emails to invoices |
| `/admin/emails` | Edit automated email templates |
| `/admin/setup` | Integration health check + JotForm webhook URL |

## Content model

All content lives in Supabase JSONB columns — no schema migrations needed for new fields.

| Table | Type | Notes |
|-------|------|-------|
| `content_blog_posts` | `BlogPost` | slug PK, published_at for sort |
| `content_events` | `OrgEvent` | slug PK, start_date for sort |
| `content_camp_settings` | `Partial<CampSettings>` | singleton row `id='current'`; merged with seed defaults |

### BlogPost type (lib/types.ts)

```ts
interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  body?: string;          // plain text OR HTML (auto-detected in BlogPostBody)
  heroImage?: string;     // public URL from content-images bucket
  links?: BlogLink[];     // optional action buttons on the post + cards
}

interface BlogLink { url: string; label: string; }
```

### CampSettings — announcement override

`CampSettings.announcementOverride` controls the home-page banner:

```ts
interface AnnouncementOverride {
  enabled: boolean;       // false → auto camp-registration news
  label?: string;         // badge text, default "Big News"
  message: string;
  highlight?: string;     // bold green text appended to message
  links: AnnouncementLink[];
}
```

Admin edits this at `/admin/announcement`. Default seed has the pre-registration
survey + newsletter links live immediately.

## Image uploads

All images go to the `content-images` Supabase Storage bucket (public).

- **Max size:** 8 MB (enforced client-side + server-side + bucket policy)
- **Accepted types:** JPEG, PNG, WEBP, GIF, AVIF
- **Folders:** `blog/`, `events/`, `camps/` (namespaced by form)
- **Server action:** `uploadImageAction` in `app/admin/actions.ts`
- **Storage helper:** `uploadContentImage` in `lib/admin/media.ts`
- **Next.js body limit:** `serverActions.bodySizeLimit: "8mb"` in `next.config.mjs`
  (raised from the 1 MB default — this was the root cause of the previous upload error)

## Blog body: HTML vs plain text

`BlogPostBody` auto-detects whether `body` contains HTML tags using:

```
/<(?:img|p|br|a|strong|em|b|i|ul|ol|li|h[1-6]|div|span|blockquote|hr|pre|code)\b/i
```

- **HTML mode** → `dangerouslySetInnerHTML` + `blog-html-body` CSS class (admin-only content, trusted)
- **Plain text mode** → paragraph-split renderer with auto-link detection

Admins insert inline images via the "Insert image" button in the blog form, which uploads and inserts `<img src="..." />` at cursor position.

## Responsive design

Design tokens use the `paper/ink/pine/forest/ember/brass` colour system (public site) and `camp-paper/camp-bark/camp-flame/camp-ink` (camp section).

Padding convention: `px-4 sm:px-6 md:px-10` on all max-width containers. The old `px-6 md:px-10` pattern (missing the `sm:` step) was fixed in camp registration pages.

## Tests

```
tests/
  media-validation.test.ts     Image MIME/size validation, folder sanitisation
  image-uploader-client.test.ts  Client-side pre-flight checks
  blog-links.test.ts           slugify(), compact(), parseLinksJson()
  blog-post-body.test.ts       HTML detection regex, URL linkification
  announcement-override.test.ts  buildBigNews() with/without override
  announcement-form.test.ts    parseAnnouncementLinks()
  registration-page.test.ts    /camp/register routing logic + CTA link checks
```

Run: `pnpm test` — 118 tests, all pure functions/logic (no network, no DOM).

## Deployment

Deployed on Vercel. Main branch → production. Preview deploys on PRs.

Cron jobs (`/api/cron/daily`, `/api/reminders/sweep`) need `CRON_SECRET` header.
JotForm webhook (`/api/jotform-webhook`) needs `JOTFORM_WEBHOOK_SECRET`.
