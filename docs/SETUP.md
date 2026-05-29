# MYO Camp — Setup Guide

Complete launch checklist. **Test everything first** using [`SANDBOX.md`](SANDBOX.md) before production.

**DNS handoff for Mahfouthi:** [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md) — send him that file plus the Resend DNS values from your dashboard.

---

## Who does what

### You can do yourself (no code, no Mahfouthi)

Everything below is in the **admin GUI** after env vars are set:

| Area | URL | What you can do |
|------|-----|-----------------|
| Dashboard | `/admin` | Overview stats, quick links |
| Camps | `/admin/camps` | Create/edit camps: dates, fees, capacity, JotForm IDs, hero image, featured on events, open/full/closed |
| Registrations | `/admin/camps/{slug}` | View registrations, invoices, waitlist; cancel/reactivate; manual registration |
| Registration detail | `/admin/camps/{slug}/registrations/{id}` | Send reminder now, pause reminders, record cash, view payment history |
| E-Transfer inbox | `/admin/inbox` | Match unmatched e-Transfer emails to invoices |
| Email templates | `/admin/emails` | Edit all automated email copy + preview |
| Events | `/admin/events` | Add/edit events, photos, link event → camp session, external register URLs |
| Blog | `/admin/blog` | Add/edit blog posts + hero images |
| Setup | `/admin/setup` | Status of all integrations, copy JotForm webhook URL |
| Gmail | `/admin/setup/gmail` | Connect/disconnect payments inbox for auto-match |

**Public site (no admin):** camp pages, registration picker, payment pages, events, blog — all driven by admin content above.

### You set up (accounts + API keys you create)

| Service | You create | Env vars |
|---------|------------|----------|
| **Supabase** | Project + run `schema.sql` + admin user | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Vercel** | Connect GitHub repo, env vars | All vars in dashboard |
| **Secrets** | Generate random strings | `JOTFORM_WEBHOOK_SECRET`, `CRON_SECRET` |
| **Admin access** | Your email in Supabase Auth + `ADMIN_EMAILS` | `ADMIN_EMAILS` |
| **JotForm** | Registration + waitlist forms, webhook URL | `JOTFORM_WEBHOOK_SECRET` |
| **PayPal Developer** | Sandbox app (test) → Live app (prod) | `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT` |
| **Resend** | Account + API key; add domain | `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO` |
| **Google Cloud** | OAuth app for Gmail API (optional) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

### Ask Mahfouthi for (his side)

| Item | Why | Details |
|------|-----|---------|
| **DNS for `myo.camp`** | Site + email sending | Full instructions: [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md) |
| **Vercel A + CNAME** (or nameservers) | Website live at myo.camp | A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com` |
| **Resend DNS records** | Emails from `camp@myo.camp` | MX + TXT on `send`, TXT on `resend._domainkey` — **values from your Resend dashboard** |
| **Registrar access** (if needed) | Namespro.ca DNS panel | So he can add the records above |
| **Vercel team invite** (optional) | If he manages hosting billing | Invite his email to Vercel project |
| **Org PayPal business account** (if applicable) | Live payments under MYO entity | You create Developer app; he may need to approve business account |
| **Org JotForm account** (if applicable) | Forms under org login | Or you use personal account — either works |
| **Payments Gmail inbox** | e-Transfer notifications | e.g. `myoadmin@gmail.com` — he connects via `/admin/setup/gmail` or gives you OAuth access to set up Google Cloud |
| **Google Cloud project owner** (optional) | Gmail OAuth consent screen | If org requires official Google Cloud under MYO account |

**You do NOT need Mahfouthi for:** Supabase, admin content, camps, registrations, PayPal sandbox testing, local dev, Vercel preview deploys.

---

## Sandbox first

Before production, follow **[`SANDBOX.md`](SANDBOX.md)** end-to-end:

1. Separate Supabase project `myocamp-sandbox`
2. `.env.local` with PayPal **sandbox** + Resend test sender
3. JotForm webhook → Vercel Preview URL (or ngrok)
4. Run the full checklist (registration → pay → email → waitlist)

---

## 1. Supabase (database + auth)

### Create project
1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Copy from **Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (or legacy anon key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose in browser)

### Run schema
1. Open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/schema.sql`.
3. Run it once. Safe to re-run (idempotent).

Creates: content (events, blog, camp settings), camps, registrations, invoices, payments, waitlist, inbound emails, reminder log, gmail credentials, email templates, `content-images` storage bucket.

### Create admin user
1. **Authentication → Users → Add user** — email + password.
2. Add those emails to `ADMIN_EMAILS` in Vercel (comma-separated).

---

## 2. Vercel (hosting + env vars)

### Deploy
Push to GitHub. Vercel auto-deploys from the connected repo.

Use **Preview** env vars for sandbox; **Production** when launching.

### Environment variables

Set in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Who provides | Notes |
|----------|----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | You (Supabase) | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | You (Supabase) | Browser-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | You (Supabase) | Server-only |
| `ADMIN_EMAILS` | Yes | You | Comma-separated admin emails |
| `NEXT_PUBLIC_SITE_URL` | Yes | You | `https://myo.camp` (or preview URL for staging) |
| `JOTFORM_WEBHOOK_SECRET` | Recommended | You generate | Random string |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | For PayPal | You (PayPal Developer) | |
| `PAYPAL_CLIENT_SECRET` | For PayPal | You (PayPal Developer) | Server-only |
| `PAYPAL_ENVIRONMENT` | For PayPal | You | `sandbox` or `live` |
| `PAYMENT_EMAIL` | For e-Transfer | You / Mahfouthi | Default e-transfer destination |
| `GOOGLE_CLIENT_ID` | For e-Transfer auto-match | You (Google Cloud) | |
| `GOOGLE_CLIENT_SECRET` | For e-Transfer auto-match | You (Google Cloud) | Server-only |
| `CRON_SECRET` | Recommended | You generate | Random string |
| `RESEND_API_KEY` | For emails | You (Resend) | |
| `EMAIL_FROM_ADDRESS` | For emails | You | `camp@myo.camp` after DNS verified; `onboarding@resend.dev` for sandbox |
| `EMAIL_REPLY_TO` | Optional | You | Where parent replies go |

Copy from `.env.example` → `.env.local` for local dev.

### Cron jobs

Configured in `vercel.json` for **Vercel Hobby** (max 2 jobs, once per day each):

| Route | Schedule | Purpose |
|-------|----------|---------|
| `/api/cron/daily` | Daily 2pm UTC | Gmail poll + waitlist expiry + camp close + T-7/T-3/T-1 reminders |

**Gmail** runs once daily with everything else. For faster e-transfer matching, use **Admin → Setup → Poll Gmail** or curl anytime.

---

## 3. JotForm (registration forms)

### You do
1. Create **Registration** form (parent + camper fields).
2. Optionally create **Waitlist** form.
3. Copy form IDs from URL: `jotform.com/form/XXXXXXXX`.
4. **Settings → Integrations → Webhooks** → URL from `/admin/setup`:
   ```
   https://myo.camp/api/jotform-webhook?secret=YOUR_JOTFORM_WEBHOOK_SECRET
   ```
5. In `/admin/camps` → paste form IDs, set status **Open**.

### Ask Mahfouthi only if
- Forms must live under an org JotForm account you don't have login for.

---

## 4. PayPal (online payments)

### You do
1. [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/applications).
2. **Sandbox** app for testing → **Live** app for production.
3. Client ID + Secret → env vars.
4. `PAYPAL_ENVIRONMENT=sandbox` until launch, then `live`.

Parents pay at `/camp/pay/{reference-code}`.

### Ask Mahfouthi only if
- Live PayPal must be tied to an MYO business account only he can authorize.

---

## 5. Gmail (e-Transfer auto-matching)

### You do
1. [console.cloud.google.com](https://console.cloud.google.com) → project → enable **Gmail API**.
2. OAuth client (**Web application**).
3. **Manually** add in Google Cloud (the app does not do this for you):

   | Google Cloud field | Production example |
   |--------------------|--------------------|
   | **Authorized JavaScript origins** | `https://myo.camp` |
   | **Authorized redirect URIs** | `https://myo.camp/api/gmail/oauth/callback` |

   Also add `http://localhost:3000` + `http://localhost:3000/api/gmail/oauth/callback` for local dev, and your Vercel preview URL + `/api/gmail/oauth/callback` for preview deploys.

4. Env vars:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   # Optional — must match a redirect URI in Google exactly if set:
   GOOGLE_OAUTH_REDIRECT=https://myo.camp/api/gmail/oauth/callback
   ```
5. `/admin/setup/gmail` → copy the shown origin + redirect if unsure → **Connect Gmail**.

Parents put reference code `MYO-YYYY-XXXX` in e-Transfer memo. Unmatched → `/admin/inbox`.

### Ask Mahfouthi for
- Access to the **payments Gmail inbox** (or he clicks Connect himself on setup page).
- Google Cloud project under org account if required by policy.

---

## 6. Resend (transactional email)

### You do
1. [resend.com](https://resend.com) → API key → `RESEND_API_KEY`.
2. **Domains → Add `myo.camp`** → copy DNS records.
3. Send records to Mahfouthi → [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md).
4. After verified: `EMAIL_FROM_ADDRESS=MYO Camp <camp@myo.camp>`.
5. Edit templates at `/admin/emails`.

### Automated emails

| Template | When |
|----------|------|
| registration_received | After JotForm submission |
| invoice_reminder | T-7 / T-3 / T-1 before camp (cron) |
| waitlist_promoted | Admin promotes waitlist entry |
| payment_confirmation | Invoice paid |

### Ask Mahfouthi for
- **DNS records only** (Part 2 of DNS doc) — you paste Resend's exact values.

---

## 7. Domain (Mahfouthi + you)

### You do
1. Vercel → **Settings → Domains** → add `myo.camp` + `www.myo.camp`.
2. Resend → add domain → copy email DNS records.
3. Email Mahfouthi: DNS doc + Resend screenshot.
4. After DNS propagates: verify green in Vercel + Resend.
5. Set `NEXT_PUBLIC_SITE_URL=https://myo.camp`.

### Mahfouthi does
- Add A, CNAME, MX, TXT records at registrar (Namespro or equivalent).
- See [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md).

---

## 8. Admin first-run checklist (production)

- [ ] Sign in at `/admin`
- [ ] `/admin/setup` — all expected pills green
- [ ] Create camps at `/admin/camps/new` (Main + LIT, slugs match events)
- [ ] Link events to camps at `/admin/events`
- [ ] Upload camp hero images; feature camps on events if desired
- [ ] JotForm test submission → registration + email
- [ ] PayPal payment on `/camp/pay/{ref}`
- [ ] Gmail connected (if using auto-match)
- [ ] Email templates reviewed at `/admin/emails`
- [ ] Public `/camp/register` and `/events` look correct

---

## 9. Local development

```bash
pnpm install
cp .env.example .env.local
# Fill .env.local — use sandbox Supabase + PayPal sandbox
pnpm dev
```

Open `http://localhost:3000`. JotForm webhooks need Vercel Preview or ngrok (see SANDBOX.md).

---

## Quick reference — admin URLs

| Page | URL |
|------|-----|
| Dashboard | `/admin` |
| Camps | `/admin/camps` |
| E-Transfer inbox | `/admin/inbox` |
| Email templates | `/admin/emails` |
| Events | `/admin/events` |
| Blog | `/admin/blog` |
| Setup checklist | `/admin/setup` |
| Gmail setup | `/admin/setup/gmail` |

## Quick reference — public URLs

| Page | URL |
|------|-----|
| Camp home | `/camp` |
| Register (picker or redirect) | `/camp/register` |
| Register one camp | `/camp/{slug}/register` |
| Pay invoice | `/camp/pay/{reference-code}` |
| Claim waitlist spot | `/camp/{slug}/claim/{token}` |
| Events | `/events` |

## Related docs

| Doc | Purpose |
|-----|---------|
| [`SANDBOX.md`](SANDBOX.md) | Full test environment + E2E checklist |
| [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md) | DNS handoff for domain + email |
| [`TODO.md`](TODO.md) | Pre-launch QA checklist |
| `.env.example` | All env var keys |
