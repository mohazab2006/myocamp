-- Clarify waitlist promotion email: link opens review page, confirm happens on site.
update public.email_templates
set
  body_markdown = $$Hi {{parent_name}},

Good news — a spot just opened at **{{camp_title}}** ({{camp_dates}}) and **{{camper_name}}** is next in line.

Open the link below to **review your offer** — you'll confirm on the next page (not in this email). You have **{{claim_window}}** before we pass it to the next family:

[Review and confirm →]({{claim_url}})

After you confirm on that page, you'll go straight to payment (PayPal, e-Transfer, or cash at drop-off).

— MYO Camp$$,
  updated_at = now()
where slug = 'waitlist_promoted';
