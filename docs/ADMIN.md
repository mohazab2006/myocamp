# Admin

The `/admin` route is a password-protected owner dashboard for editing public site content.

## Login

This uses Supabase Auth email/password, not magic links.

Create the admin user in Supabase:

1. Open Supabase Dashboard.
2. Go to Authentication > Users.
3. Add the owner email and password.

Set these server environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=owner@example.com
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be used instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY` if the project uses Supabase's newer publishable keys.

`ADMIN_EMAIL` is optional but recommended. Use `ADMIN_EMAILS` with comma-separated emails if more than one owner should access `/admin`.

Supabase stores the auth session in cookies through `@supabase/ssr`. The project has a root `proxy.ts` file scoped to `/admin/:path*` so Supabase can refresh auth cookies during admin requests.

## Supabase

For content reads and writes, also set the service role key on the server:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The public site reads Supabase content when configured. If Supabase is missing or empty, the site falls back to the seeded files in `lib/content`.

## Tables

Run this SQL in Supabase:

```sql
create table if not exists public.content_events (
  slug text primary key,
  title text not null,
  start_date date not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_blog_posts (
  slug text primary key,
  title text not null,
  published_at date not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_events_updated_at on public.content_events;
create trigger content_events_updated_at
before update on public.content_events
for each row execute function public.set_updated_at();

drop trigger if exists content_blog_posts_updated_at on public.content_blog_posts;
create trigger content_blog_posts_updated_at
before update on public.content_blog_posts
for each row execute function public.set_updated_at();

alter table public.content_events enable row level security;
alter table public.content_blog_posts enable row level security;
```

No public RLS policy is required when the app reads through the server-side service role key.

## Editable Content

Current dashboard support:

- Events: title, slug, type, dates, location, audience, summary, body, image path, registration URL, registration window, cost, archived flag.
- Blog posts: title, slug, publish date, excerpt, body, image path.

Use image paths from `public/Pictures`, for example `/Pictures/trails.jpg`.

Planned later:

- Site settings: donate URL, volunteer URL, contact email, social links.
- Camp settings: registration status, dates, fees, payment details, form URL.
- Image uploads through Supabase Storage.
