-- =============================================================================
-- MYO Camp — Supabase schema (canonical, idempotent)
-- =============================================================================
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run. Wraps everything in a transaction.
--
-- Tables (all reads/writes go through the SERVICE ROLE key on the server):
--   * public.content_events         — site /events content
--   * public.content_blog_posts     — site /blog content
--   * public.content_camp_settings  — singleton row (id='current') for /camp
--
-- Security model:
--   * RLS is ENABLED on every table.
--   * No policies are defined → all anonymous & authenticated requests are
--     denied by default. Only the SERVICE ROLE key (server-only) can read/write.
--   * This matches the Next.js app, which always queries via the service role
--     key in `lib/supabase/content.ts`.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep `updated_at` fresh on every UPDATE.
-- `set search_path = public` silences Supabase's "mutable search_path" linter
-- warning and hardens the function against search-path hijacking.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: sets NEW.updated_at = now() on every row update.';

-- ---------------------------------------------------------------------------
-- public.content_events
-- ---------------------------------------------------------------------------
create table if not exists public.content_events (
  slug         text        primary key,
  title        text        not null,
  start_date   date        not null,
  data         jsonb       not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table  public.content_events             is 'Public site events shown at /events. JSON `data` holds the full OrgEvent.';
comment on column public.content_events.slug       is 'URL slug (primary key). Matches /events/[slug].';
comment on column public.content_events.title      is 'Display title (denormalized from data.title for sorting/search).';
comment on column public.content_events.start_date is 'Event start date (denormalized for cheap ordering).';
comment on column public.content_events.data       is 'Full OrgEvent payload (see lib/types.ts: OrgEvent).';

create index if not exists content_events_start_date_idx
  on public.content_events (start_date);

drop trigger if exists content_events_updated_at on public.content_events;
create trigger content_events_updated_at
before update on public.content_events
for each row execute function public.set_updated_at();

alter table public.content_events enable row level security;

-- ---------------------------------------------------------------------------
-- public.content_blog_posts
-- ---------------------------------------------------------------------------
create table if not exists public.content_blog_posts (
  slug          text        primary key,
  title         text        not null,
  published_at  date        not null,
  data          jsonb       not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.content_blog_posts              is 'Public site blog posts shown at /blog. JSON `data` holds the full BlogPost.';
comment on column public.content_blog_posts.slug         is 'URL slug (primary key). Matches /blog/[slug].';
comment on column public.content_blog_posts.title        is 'Display title (denormalized from data.title).';
comment on column public.content_blog_posts.published_at is 'Publish date (denormalized for cheap ordering).';
comment on column public.content_blog_posts.data         is 'Full BlogPost payload (see lib/types.ts: BlogPost).';

create index if not exists content_blog_posts_published_at_idx
  on public.content_blog_posts (published_at desc);

drop trigger if exists content_blog_posts_updated_at on public.content_blog_posts;
create trigger content_blog_posts_updated_at
before update on public.content_blog_posts
for each row execute function public.set_updated_at();

alter table public.content_blog_posts enable row level security;

-- ---------------------------------------------------------------------------
-- public.content_camp_settings (singleton: only id = 'current' allowed)
-- ---------------------------------------------------------------------------
create table if not exists public.content_camp_settings (
  id           text        primary key,
  data         jsonb       not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Enforce singleton: only one row, with id = 'current'.
alter table public.content_camp_settings
  drop constraint if exists content_camp_settings_singleton;
alter table public.content_camp_settings
  add  constraint content_camp_settings_singleton check (id = 'current');

comment on table  public.content_camp_settings      is 'Singleton row (id=''current'') holding partial CampSettings overrides for /camp.';
comment on column public.content_camp_settings.id   is 'Always ''current'' — enforced by content_camp_settings_singleton CHECK constraint.';
comment on column public.content_camp_settings.data is 'Partial CampSettings JSON (see lib/types.ts: CampSettings). Missing fields fall back to lib/content/camp.ts.';

drop trigger if exists content_camp_settings_updated_at on public.content_camp_settings;
create trigger content_camp_settings_updated_at
before update on public.content_camp_settings
for each row execute function public.set_updated_at();

alter table public.content_camp_settings enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket: content-images
--
-- Public read so admin-uploaded images load via plain <img src>. All writes
-- go through the SERVICE ROLE key (lib/admin/media.ts), which bypasses RLS.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  8388608, -- 8 MB, matches lib/admin/media.ts cap
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
