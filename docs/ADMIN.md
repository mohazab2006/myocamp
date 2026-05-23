# Admin

The `/admin` route is a multi-section dashboard for managing public site content. It uses Supabase Auth (email + password) and an env-var allowlist on top, so only specific addresses can sign in.

## Structure

```
/admin              → Overview (welcome, quick actions, stats)
/admin/events       → Add/edit/delete events with drag-and-drop hero images
/admin/blog         → Add/edit/delete blog posts with drag-and-drop hero images
/admin/camp         → Toggle the camp registration status badge
/admin/setup        → Live connection checklist (auth, content, allowlist)
```

The header at `/admin/*` shows the dashboard title, the section nav, a **View site** link, and **Sign out**.

## States

The overview page (`/admin`) renders one of four states based on the request:

| State | When | UI |
|---|---|---|
| `unconfigured` | Supabase env vars missing entirely | Setup checklist with numbered steps |
| `anonymous` | No active Supabase session | Sign-in form (email + password) |
| `forbidden` | Signed in but email not in `ADMIN_EMAILS` | Access-denied panel |
| `authorized` | Signed in AND on the allowlist | Full dashboard with stats + quick actions |

## Login

This uses Supabase Auth email/password (not magic links).

Create the admin user(s) in Supabase:

1. Open Supabase Dashboard → **Authentication → Users → Add user → Create new user**.
2. Fill in email + a strong password, toggle **Auto Confirm User** on.
3. Add the same email to `ADMIN_EMAILS` in `.env.local` (and in Vercel for production).

## Environment variables

See `.env.example` for the full list. Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   # or NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=...              # server-only — never expose
ADMIN_EMAILS=you@example.com,teammate@example.com
```

`/admin/setup` shows live presence/absence of each one so you can verify the runtime is configured.

Auth cookies are refreshed by `proxy.ts` (Next middleware scoped to `/admin/:path*`).

## Schema

The canonical schema lives in [`supabase/schema.sql`](../supabase/schema.sql). It is idempotent and wrapped in a transaction, so it is safe to re-run on any Supabase project.

To apply it:

1. Open Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/schema.sql`.
3. Run.

It creates:

- Three tables — `content_events`, `content_blog_posts`, `content_camp_settings` — with `updated_at` triggers, indexes, and a singleton `CHECK` constraint on `content_camp_settings.id`.
- The `content-images` **Storage bucket** (public read, 8 MB cap, image MIME types only) used by the drag-and-drop image uploader.

RLS is enabled on every table with **no policies defined**, so all anon/authenticated requests are denied by default. The Next.js app reads and writes via the **service role key** (server-only), which bypasses RLS. The Storage bucket is public so admin-uploaded images load via plain `<img src>`.

## Image uploads

The admin event and blog post editors have a **drag-and-drop image uploader** that:

- Accepts `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/avif`.
- Caps at 8 MB.
- Uploads to the `content-images` Supabase Storage bucket via a server action (`uploadImageAction` in `app/admin/actions.ts`).
- Returns the public URL and stores it on the event/post `heroImage` field.

If you'd rather use a static image already in `public/Pictures/`, paste its path manually — anything stored as `heroImage` works.

## Editable content

Current dashboard support:

- **Events**: title, slug, type, dates, location, audience, summary, body, hero image, registration URL, registration window, cost, archived flag.
- **Blog posts**: title, slug, publish date, excerpt, body, hero image.
- **Camp**: registration status (Opening soon / Open now / Full / Closed). Drives the badge and copy on `/camp/register`. The JotForm itself is still controlled inside JotForm — toggling status here only changes how the site frames the form.

Planned later:

- Site settings: donate URL, volunteer URL, contact email, social links.
- Camp settings (the rest): dates, fees, payment details, form URL, waitlist URL.
