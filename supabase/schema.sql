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

-- ===========================================================================
-- 0002 — camps, registrations, invoices, payments, waitlist
-- (mirrored from supabase/migrations/0002_camps_and_payments.sql)
-- ===========================================================================

-- camps
create table if not exists public.camps (
  id                              uuid        primary key default gen_random_uuid(),
  slug                            text        unique not null,
  title                           text        not null,
  status                          text        not null default 'draft'
                                              check (status in ('draft', 'open', 'full', 'closed', 'archived')),
  capacity                        integer,
  start_date                      date        not null,
  end_date                        date        not null,
  location                        text,
  fee_per_camper                  numeric(10,2) not null default 0,
  registration_form_jotform_id    text,
  waitlist_form_jotform_id        text,
  registration_closes_at          timestamptz,
  auto_close_at_capacity          boolean     not null default true,
  notes                           text,
  data                            jsonb       not null default '{}'::jsonb,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);
create index if not exists camps_status_idx     on public.camps (status);
create index if not exists camps_start_date_idx on public.camps (start_date desc);
drop trigger if exists camps_updated_at on public.camps;
create trigger camps_updated_at before update on public.camps
for each row execute function public.set_updated_at();
alter table public.camps enable row level security;

-- registrations
create table if not exists public.registrations (
  id                          uuid        primary key default gen_random_uuid(),
  camp_id                     uuid        not null references public.camps(id) on delete cascade,
  jotform_submission_id       text        unique,
  source                      text        not null default 'jotform'
                                          check (source in ('jotform', 'waitlist_claim', 'manual')),
  parent_name                 text,
  parent_email                text,
  parent_phone                text,
  campers                     jsonb       not null default '[]'::jsonb,
  raw_payload                 jsonb       not null default '{}'::jsonb,
  status                      text        not null default 'active'
                                          check (status in ('active', 'cancelled', 'refunded')),
  promoted_from_waitlist_id   uuid,
  cancelled_at                timestamptz,
  cancelled_reason            text,
  notes                       text,
  submitted_at                timestamptz not null default now(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists registrations_camp_id_idx      on public.registrations (camp_id);
create index if not exists registrations_status_idx       on public.registrations (status);
create index if not exists registrations_parent_email_idx on public.registrations (parent_email);
create index if not exists registrations_submitted_at_idx on public.registrations (submitted_at desc);
drop trigger if exists registrations_updated_at on public.registrations;
create trigger registrations_updated_at before update on public.registrations
for each row execute function public.set_updated_at();
alter table public.registrations enable row level security;

-- invoices
create table if not exists public.invoices (
  id                       uuid        primary key default gen_random_uuid(),
  registration_id          uuid        not null references public.registrations(id) on delete cascade,
  reference_code           text        unique not null,
  amount_due               numeric(10,2) not null,
  amount_paid              numeric(10,2) not null default 0,
  status                   text        not null default 'pending'
                                       check (status in ('pending', 'paid', 'partial', 'refunded', 'cancelled')),
  due_date                 date,
  sent_at                  timestamptz,
  paid_at                  timestamptz,
  last_reminded_at         timestamptz,
  reminder_count           integer     not null default 0,
  auto_reminders_paused    boolean     not null default false,
  paused_until             timestamptz,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists invoices_registration_id_idx on public.invoices (registration_id);
create index if not exists invoices_reference_code_idx  on public.invoices (reference_code);
create index if not exists invoices_status_idx          on public.invoices (status);
drop trigger if exists invoices_updated_at on public.invoices;
create trigger invoices_updated_at before update on public.invoices
for each row execute function public.set_updated_at();
alter table public.invoices enable row level security;

-- payments
create table if not exists public.payments (
  id              uuid        primary key default gen_random_uuid(),
  invoice_id      uuid        references public.invoices(id) on delete set null,
  method          text        not null
                              check (method in ('paypal', 'etransfer', 'cash', 'stripe', 'manual')),
  amount          numeric(10,2) not null,
  status          text        not null default 'received'
                              check (status in ('received', 'refunded', 'failed', 'pending')),
  external_ref    text,
  sender_name     text,
  sender_email    text,
  sender_memo     text,
  cash_received   boolean,
  received_at     timestamptz not null default now(),
  matched_by      uuid,
  notes           text,
  raw_payload     jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists payments_invoice_id_idx  on public.payments (invoice_id);
create index if not exists payments_method_idx      on public.payments (method);
create index if not exists payments_status_idx      on public.payments (status);
create index if not exists payments_received_at_idx on public.payments (received_at desc);
create index if not exists payments_unmatched_idx   on public.payments (received_at desc) where invoice_id is null;
drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();
alter table public.payments enable row level security;

-- waitlist_entries
create table if not exists public.waitlist_entries (
  id                          uuid        primary key default gen_random_uuid(),
  camp_id                     uuid        not null references public.camps(id) on delete cascade,
  jotform_submission_id       text        unique,
  position                    integer,
  parent_name                 text,
  parent_email                text,
  parent_phone                text,
  camper_name                 text,
  raw_payload                 jsonb       not null default '{}'::jsonb,
  status                      text        not null default 'active'
                                          check (status in ('active', 'promoted', 'claimed', 'expired', 'removed')),
  promoted_at                 timestamptz,
  claim_token                 text        unique,
  claim_expires_at            timestamptz,
  claimed_registration_id     uuid        references public.registrations(id) on delete set null,
  submitted_at                timestamptz not null default now(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists waitlist_camp_id_idx     on public.waitlist_entries (camp_id);
create index if not exists waitlist_status_idx      on public.waitlist_entries (status);
create index if not exists waitlist_position_idx    on public.waitlist_entries (camp_id, position);
create index if not exists waitlist_claim_token_idx on public.waitlist_entries (claim_token) where claim_token is not null;
drop trigger if exists waitlist_entries_updated_at on public.waitlist_entries;
create trigger waitlist_entries_updated_at before update on public.waitlist_entries
for each row execute function public.set_updated_at();
alter table public.waitlist_entries enable row level security;

-- inbound_emails
create table if not exists public.inbound_emails (
  id                       uuid        primary key default gen_random_uuid(),
  gmail_message_id         text        unique not null,
  from_address             text,
  subject                  text,
  body_text                text,
  body_html                text,
  parsed_amount            numeric(10,2),
  parsed_sender_name       text,
  parsed_memo              text,
  parsed_reference_code    text,
  match_status             text        not null default 'pending'
                                       check (match_status in ('pending', 'matched', 'unmatched', 'duplicate', 'not_payment', 'error')),
  matched_payment_id       uuid        references public.payments(id) on delete set null,
  error_message            text,
  received_at              timestamptz not null default now(),
  processed_at             timestamptz,
  raw_payload              jsonb       not null default '{}'::jsonb
);
create index if not exists inbound_emails_match_status_idx on public.inbound_emails (match_status);
create index if not exists inbound_emails_received_at_idx  on public.inbound_emails (received_at desc);
alter table public.inbound_emails enable row level security;

-- reminder_log
create table if not exists public.reminder_log (
  id                  uuid        primary key default gen_random_uuid(),
  invoice_id          uuid        references public.invoices(id) on delete cascade,
  registration_id     uuid        references public.registrations(id) on delete cascade,
  waitlist_entry_id   uuid        references public.waitlist_entries(id) on delete cascade,
  reminder_number     text        not null,
  template_id         text,
  trigger             text        not null check (trigger in ('auto', 'manual')),
  sent_by             uuid,
  sent_to             text,
  subject             text,
  email_provider_id   text,
  error_message       text,
  status              text        not null default 'sent'
                                  check (status in ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'failed')),
  sent_at             timestamptz not null default now()
);

-- Upgrade reminder_log from older 0002 installs (table may exist without these columns)
alter table public.reminder_log alter column invoice_id drop not null;
alter table public.reminder_log alter column sent_to drop not null;
alter table public.reminder_log
  add column if not exists registration_id   uuid references public.registrations(id) on delete cascade,
  add column if not exists waitlist_entry_id uuid references public.waitlist_entries(id) on delete cascade,
  add column if not exists error_message     text;

create index if not exists reminder_log_invoice_id_idx          on public.reminder_log (invoice_id);
create index if not exists reminder_log_registration_id_idx     on public.reminder_log (registration_id);
create index if not exists reminder_log_waitlist_entry_id_idx   on public.reminder_log (waitlist_entry_id);
create index if not exists reminder_log_sent_at_idx             on public.reminder_log (sent_at desc);
alter table public.reminder_log enable row level security;

-- ---------------------------------------------------------------------------
-- gmail_credentials (migration 0003)
-- ---------------------------------------------------------------------------
create table if not exists public.gmail_credentials (
  email                 text        primary key,
  access_token          text        not null,
  refresh_token         text        not null,
  token_expires_at      timestamptz not null,
  scope                 text        not null,
  last_polled_at        timestamptz,
  last_polled_status    text        check (last_polled_status in ('ok', 'error')),
  last_polled_error     text,
  last_messages_seen    integer     not null default 0,
  last_messages_matched integer     not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists gmail_credentials_last_polled_idx on public.gmail_credentials (last_polled_at desc);
drop trigger if exists gmail_credentials_updated_at on public.gmail_credentials;
create trigger gmail_credentials_updated_at
before update on public.gmail_credentials
for each row execute function public.set_updated_at();
alter table public.gmail_credentials enable row level security;

-- ---------------------------------------------------------------------------
-- email_templates (migration 0004)
-- ---------------------------------------------------------------------------
create table if not exists public.email_templates (
  slug              text        primary key,
  label             text        not null,
  description       text,
  subject           text        not null,
  body_markdown     text        not null,
  enabled           boolean     not null default true,
  updated_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
drop trigger if exists email_templates_updated_at on public.email_templates;
create trigger email_templates_updated_at
before update on public.email_templates
for each row execute function public.set_updated_at();
alter table public.email_templates enable row level security;

insert into public.email_templates (slug, label, description, subject, body_markdown)
values
  (
    'registration_received',
    'Registration received',
    'Sent automatically right after a parent submits the JotForm registration. Includes the payment link.',
    'We received your {{camp_title}} registration · {{ref}}',
    $$Hi {{parent_name}},

Thanks for registering **{{camper_name}}** for **{{camp_title}}** ({{camp_dates}}).

Your reference code is **{{ref}}** and your balance is **{{amount}} CAD**.

To pay now — PayPal, e-Transfer, or "I'll bring cash" — visit:

[{{payment_url}}]({{payment_url}})

Keep the reference code somewhere safe. For e-Transfer, put **{{etransfer_memo}}** in the memo (reference + your child's first name) so we can auto-match your payment.

— MYO Camp$$
  ),
  (
    'payment_followup',
    'Payment follow-up (2 days)',
    'Auto-sent 2 days after registration when we have no payment on file and nothing in Needs match. Cron-driven.',
    'Action needed: secure {{camper_name}}''s spot · {{ref}}',
    $$Hi {{parent_name}},

It's been a couple of days since you registered **{{camper_name}}** for **{{camp_title}}** ({{camp_dates}}), and we don't have payment on file yet. Unpaid spots may be released to families on the waitlist.

**Balance owing:** {{amount}} CAD
**Reference:** {{ref}}

Pay now — PayPal, e-Transfer, or cash at drop-off:

[{{payment_url}}]({{payment_url}})

If you pay by e-Transfer, put **{{etransfer_memo}}** in the message / memo field (reference + your child's name) so we can match it right away.

**Already paid?** Reply to this email, tell us your child's name, and confirm that payment was sent. We'll sort it out manually.

Questions? Reply here or email {{contact_email}}.

— MYO Camp$$
  ),
  (
    'invoice_reminder',
    'Invoice reminder',
    'Auto-sent when an unpaid invoice approaches the camp start (T-7 / T-3 / T-1 days). Cron-driven.',
    'Reminder: {{amount}} owing for {{camp_title}} · {{ref}}',
    $$Hi {{parent_name}},

Quick reminder that **{{amount}} CAD** is still owing for **{{camper_name}}**'s spot at **{{camp_title}}** ({{camp_dates}}).

Your reference is **{{ref}}**.

Pay in 60 seconds: [{{payment_url}}]({{payment_url}})

If you've already paid, please ignore this — your e-Transfer may still be in transit.

— MYO Camp$$
  ),
  (
    'waitlist_promoted',
    'Waitlist promotion',
    'Sent when the admin promotes a waitlist entry. Includes the time-limited claim link.',
    'A spot just opened at {{camp_title}}',
    $$Hi {{parent_name}},

Good news — a spot just opened at **{{camp_title}}** ({{camp_dates}}) and **{{camper_name}}** is next in line.

Open the link below to **review your offer** — you'll confirm on the next page (not in this email). You have **{{claim_window}}** before we pass it to the next family:

[Review and confirm →]({{claim_url}})

After you confirm on that page, you'll go straight to payment (PayPal, e-Transfer, or cash at drop-off).

— MYO Camp$$
  ),
  (
    'payment_confirmation',
    'Payment confirmation',
    'Sent automatically when an invoice flips to paid (PayPal, matched e-Transfer, or cash pledge).',
    'Paid in full · {{camper_name}} for {{camp_title}}',
    $$Hi {{parent_name}},

We've received **{{amount_paid}} CAD** for **{{camper_name}}**'s spot at **{{camp_title}}**. You're all set.

Reference: **{{ref}}**
Method: **{{payment_method}}**

We'll send drop-off details closer to the date. Reply to this email if anything changes.

— MYO Camp$$
  )
on conflict (slug) do nothing;

commit;
