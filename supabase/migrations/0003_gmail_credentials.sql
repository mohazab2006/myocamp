-- =============================================================================
-- MYO Camp — 0003: gmail_credentials
-- =============================================================================
-- Stores the OAuth refresh+access tokens for the inbox the e-transfer poller
-- watches. PK on `email` so you could connect multiple inboxes in future,
-- but day 4 only uses the first (most-recent) row.
--
-- Heartbeat fields (last_polled_at / last_polled_status) drive the dead-man's
-- switch banner on /admin.
-- =============================================================================

begin;

create table if not exists public.gmail_credentials (
  email                text        primary key,
  access_token         text        not null,
  refresh_token        text        not null,
  token_expires_at     timestamptz not null,
  scope                text        not null,
  last_polled_at       timestamptz,
  last_polled_status   text        check (last_polled_status in ('ok', 'error')),
  last_polled_error    text,
  last_messages_seen   integer     not null default 0,
  last_messages_matched integer    not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table  public.gmail_credentials                     is 'OAuth tokens + heartbeat for the Gmail inbox watched by the e-transfer poller.';
comment on column public.gmail_credentials.scope               is 'Granted OAuth scopes (space-separated). Must include gmail.readonly.';
comment on column public.gmail_credentials.last_polled_at      is 'Updated every poll cycle. Drives the dead-man''s-switch banner on /admin.';
comment on column public.gmail_credentials.last_polled_status  is 'ok | error — last poll outcome.';
comment on column public.gmail_credentials.last_messages_seen  is 'Last poll: how many Interac emails were processed (matched + unmatched).';
comment on column public.gmail_credentials.last_messages_matched is 'Last poll: how many of those auto-matched to an invoice.';

create index if not exists gmail_credentials_last_polled_idx on public.gmail_credentials (last_polled_at desc);

drop trigger if exists gmail_credentials_updated_at on public.gmail_credentials;
create trigger gmail_credentials_updated_at
before update on public.gmail_credentials
for each row execute function public.set_updated_at();

alter table public.gmail_credentials enable row level security;

commit;
