-- =============================================================================
-- MYO Camp — 0004: email_templates
-- =============================================================================
-- Owner-editable email copy. Every automated email pulls subject + body from
-- this table at send time, so changes ship without redeploys (the "0 lines
-- of code" promise).
--
-- Seeded with the four templates the system uses out of the box:
--   - registration_received   (after JotForm submission, includes payment link)
--   - invoice_reminder        (cron-driven, T-7 / T-3 / T-1 day cadence)
--   - waitlist_promoted       (on admin clicks Promote, includes claim link)
--   - payment_confirmation    (when invoice flips to paid)
-- =============================================================================

begin;

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

comment on table  public.email_templates              is 'Owner-editable email templates. Subject + body use {{placeholder}} substitution at send time.';
comment on column public.email_templates.slug         is 'Stable key — used by code (registration_received, invoice_reminder, …).';
comment on column public.email_templates.body_markdown is 'Markdown source. Rendered to HTML at send time by lib/email/templates.ts.';
comment on column public.email_templates.enabled      is 'If false, the auto-send pipeline silently skips this template. Owners can toggle.';

drop trigger if exists email_templates_updated_at on public.email_templates;
create trigger email_templates_updated_at
before update on public.email_templates
for each row execute function public.set_updated_at();

alter table public.email_templates enable row level security;

-- ---------------------------------------------------------------------------
-- Seed defaults (idempotent — only inserts if missing)
-- ---------------------------------------------------------------------------

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

Keep the reference code somewhere safe; if you e-Transfer make sure it's in the memo so we can auto-match your payment.

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

-- ---------------------------------------------------------------------------
-- Extend reminder_log so it can also log non-invoice notices (waitlist
-- promotion, registration receipt). The original schema required invoice_id;
-- we relax that and add registration_id / waitlist_entry_id back-references
-- so every send shows up in the right contact-history view.
-- ---------------------------------------------------------------------------

alter table public.reminder_log alter column invoice_id drop not null;
alter table public.reminder_log alter column sent_to    drop not null;

alter table public.reminder_log
  add column if not exists registration_id   uuid references public.registrations(id)     on delete cascade,
  add column if not exists waitlist_entry_id uuid references public.waitlist_entries(id)  on delete cascade,
  add column if not exists error_message     text;

create index if not exists reminder_log_registration_id_idx   on public.reminder_log (registration_id);
create index if not exists reminder_log_waitlist_entry_id_idx on public.reminder_log (waitlist_entry_id);

commit;
