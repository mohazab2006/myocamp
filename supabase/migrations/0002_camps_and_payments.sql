-- =============================================================================
-- MYO Camp — 0002: camps, registrations, invoices, payments, waitlist
-- =============================================================================
-- Adds the full registration + payment pipeline as a delta on top of
-- supabase/schema.sql (0001). Idempotent and wrapped in a transaction.
-- Safe to re-run.
--
-- Tables added:
--   * public.camps                — one row per camp instance (Main 2026, LIT, etc.)
--   * public.registrations        — campers registered, linked to a camp
--   * public.invoices             — one per registration, with reference code
--   * public.payments             — payment records (paypal/etransfer/cash/...)
--   * public.waitlist_entries     — waitlist queue per camp + promote/claim flow
--   * public.inbound_emails       — audit log of Gmail-parsed e-transfer emails
--   * public.reminder_log         — audit log of every reminder email sent
--
-- Security model: same as 0001 — RLS enabled, no policies; only the server
-- service role can read/write via lib/admin/* helpers.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- camps
-- ---------------------------------------------------------------------------
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

comment on table  public.camps                             is 'A single camp instance (e.g. "Main Camp 2026"). Multiple per year supported; one usually active.';
comment on column public.camps.slug                        is 'URL slug (e.g. "main-camp-2026"). Used in /camp/[slug] and /admin/camps/[slug].';
comment on column public.camps.status                      is 'draft | open | full | closed | archived. Drives which form the public /camp page shows.';
comment on column public.camps.registration_form_jotform_id is 'JotForm ID for the registration form. Editable in admin — owner can swap forms without code.';
comment on column public.camps.waitlist_form_jotform_id    is 'JotForm ID for the waitlist form. Auto-shown when camp is full.';
comment on column public.camps.fee_per_camper              is 'Per-camper price. Invoice amount = fee_per_camper × number of campers in the registration.';

create index if not exists camps_status_idx     on public.camps (status);
create index if not exists camps_start_date_idx on public.camps (start_date desc);

drop trigger if exists camps_updated_at on public.camps;
create trigger camps_updated_at
before update on public.camps
for each row execute function public.set_updated_at();

alter table public.camps enable row level security;

-- ---------------------------------------------------------------------------
-- registrations
-- ---------------------------------------------------------------------------
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

comment on table  public.registrations                        is 'A registration for a camp. One per JotForm submission; may contain multiple campers.';
comment on column public.registrations.campers                is 'JSON array of camper objects ({name, age, allergies, medical, ...}).';
comment on column public.registrations.raw_payload            is 'Full original JotForm submission payload for audit.';
comment on column public.registrations.source                 is 'How the registration was created: jotform (normal), waitlist_claim (promoted), manual (admin entered).';
comment on column public.registrations.promoted_from_waitlist_id is 'FK into waitlist_entries when this registration came from a promotion.';

create index if not exists registrations_camp_id_idx      on public.registrations (camp_id);
create index if not exists registrations_status_idx       on public.registrations (status);
create index if not exists registrations_parent_email_idx on public.registrations (parent_email);
create index if not exists registrations_submitted_at_idx on public.registrations (submitted_at desc);

drop trigger if exists registrations_updated_at on public.registrations;
create trigger registrations_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
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

comment on table  public.invoices                is 'One invoice per registration. Reference code parents include in e-transfer memos.';
comment on column public.invoices.reference_code is 'Human-friendly reference (e.g. MYO-2026-A4F2). Unique. Matched against e-transfer memos.';
comment on column public.invoices.status         is 'pending | paid | partial | refunded | cancelled. Auto-flips on payment.';

create index if not exists invoices_registration_id_idx on public.invoices (registration_id);
create index if not exists invoices_reference_code_idx  on public.invoices (reference_code);
create index if not exists invoices_status_idx          on public.invoices (status);

drop trigger if exists invoices_updated_at on public.invoices;
create trigger invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
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

comment on table  public.payments              is 'Every payment received. invoice_id is nullable so unmatched payments can sit in a triage queue.';
comment on column public.payments.method       is 'paypal | etransfer | cash | stripe | manual. method=cash uses cash_received bool to track physical pickup.';
comment on column public.payments.external_ref is 'Provider-side ID: PayPal txn id, Gmail message id, Stripe session id, etc.';
comment on column public.payments.cash_received is 'For method=cash: false = parent picked cash but money not yet in hand; true = collected. Optional tracking.';
comment on column public.payments.matched_by   is 'Admin user id who matched/created this payment. NULL when auto-matched (PayPal/Stripe webhook or Gmail parser).';

create index if not exists payments_invoice_id_idx  on public.payments (invoice_id);
create index if not exists payments_method_idx      on public.payments (method);
create index if not exists payments_status_idx      on public.payments (status);
create index if not exists payments_received_at_idx on public.payments (received_at desc);
-- Partial index for the unmatched-payments triage queue.
create index if not exists payments_unmatched_idx   on public.payments (received_at desc) where invoice_id is null;

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

-- ---------------------------------------------------------------------------
-- waitlist_entries
-- ---------------------------------------------------------------------------
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

comment on table  public.waitlist_entries           is 'Ordered queue per camp. When a spot opens, top entry is promoted with a time-limited claim token.';
comment on column public.waitlist_entries.position  is 'Display order. Auto-assigned at signup time, gaps allowed after removals.';
comment on column public.waitlist_entries.claim_token is 'Single-use opaque token. Parent visits /camp/[slug]/claim/[token] to accept the spot.';
comment on column public.waitlist_entries.status    is 'active | promoted (email sent, awaiting claim) | claimed | expired | removed.';

create index if not exists waitlist_camp_id_idx     on public.waitlist_entries (camp_id);
create index if not exists waitlist_status_idx      on public.waitlist_entries (status);
create index if not exists waitlist_position_idx    on public.waitlist_entries (camp_id, position);
create index if not exists waitlist_claim_token_idx on public.waitlist_entries (claim_token) where claim_token is not null;

drop trigger if exists waitlist_entries_updated_at on public.waitlist_entries;
create trigger waitlist_entries_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

alter table public.waitlist_entries enable row level security;

-- ---------------------------------------------------------------------------
-- inbound_emails (Gmail parser audit log)
-- ---------------------------------------------------------------------------
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

comment on table  public.inbound_emails             is 'Every e-transfer notification email parsed by the Gmail watcher. Full audit trail.';
comment on column public.inbound_emails.match_status is 'pending | matched (linked to payment) | unmatched (no invoice match) | duplicate | not_payment | error.';

create index if not exists inbound_emails_match_status_idx on public.inbound_emails (match_status);
create index if not exists inbound_emails_received_at_idx  on public.inbound_emails (received_at desc);

alter table public.inbound_emails enable row level security;

-- ---------------------------------------------------------------------------
-- reminder_log
-- ---------------------------------------------------------------------------
create table if not exists public.reminder_log (
  id                  uuid        primary key default gen_random_uuid(),
  invoice_id          uuid        not null references public.invoices(id) on delete cascade,
  reminder_number     text        not null,
  template_id         text,
  trigger             text        not null check (trigger in ('auto', 'manual')),
  sent_by             uuid,
  sent_to             text        not null,
  subject             text,
  email_provider_id   text,
  status              text        not null default 'sent'
                                  check (status in ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'failed')),
  sent_at             timestamptz not null default now()
);

comment on table public.reminder_log is 'Every reminder/notice email sent for an invoice. Lets the admin see contact history per registration.';

create index if not exists reminder_log_invoice_id_idx on public.reminder_log (invoice_id);
create index if not exists reminder_log_sent_at_idx    on public.reminder_log (sent_at desc);

alter table public.reminder_log enable row level security;

commit;
