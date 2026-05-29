-- =============================================================================
-- MYO Camp — 0007: payment_followup email template
-- =============================================================================
-- Sent ~2 days after registration when no payment signal (no pay, cash pledge,
-- auto-match, or Needs match). Nudges parents before spot release.
-- =============================================================================

begin;

insert into public.email_templates (slug, label, description, subject, body_markdown)
values
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
  )
on conflict (slug) do nothing;

commit;
