-- Remove PayPal references from parent-facing email template bodies.
-- Uses replace() so admin customisations to other parts of the template are preserved.

begin;

update email_templates
set body_markdown = replace(
  body_markdown,
  'To pay now — PayPal, e-Transfer, or "I''ll bring cash" — visit:',
  'To pay now — e-Transfer or cash — visit:'
)
where slug = 'registration_received';

update email_templates
set body_markdown = replace(
  body_markdown,
  'Pay now — PayPal, e-Transfer, or cash at drop-off:',
  'Pay now — e-Transfer or cash at drop-off:'
)
where slug = 'payment_followup';

update email_templates
set body_markdown = replace(
  body_markdown,
  'you''ll go straight to payment (PayPal, e-Transfer, or cash at drop-off).',
  'you''ll go straight to payment (e-Transfer or cash).'
)
where slug = 'waitlist_promoted';

update email_templates
set description = replace(
  description,
  'Sent automatically when an invoice flips to paid (PayPal, matched e-Transfer, or cash pledge).',
  'Sent automatically when an invoice flips to paid (matched e-Transfer or cash pledge).'
)
where slug = 'payment_confirmation';

commit;
