# MYO Camp — Full sandbox testing guide

Use this to test **every flow** before going live. Nothing here touches real parent data or real money if you follow the sandbox settings below.

---

## Sandbox architecture (recommended)

| Layer | Sandbox choice | Production later |
|-------|----------------|------------------|
| App | Local `pnpm dev` **or** Vercel **Preview** deploy | Vercel Production |
| Database | **Separate** Supabase project `myocamp-sandbox` | Supabase production project |
| PayPal | `PAYPAL_ENVIRONMENT=sandbox` | `live` |
| JotForm | Test forms (duplicate prod forms) | Real registration forms |
| Email | Resend test key + `onboarding@resend.dev` **or** verified domain | `camp@myo.camp` |
| Gmail match | Personal/test Gmail via OAuth | Org payments inbox |
| Domain | `localhost:3000` or `*.vercel.app` preview URL | `myo.camp` |

**Rule:** Never point sandbox webhooks at production Supabase, and never use live PayPal in sandbox.

---

## Step 1 — Create sandbox Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → name it `myocamp-sandbox`.
2. **SQL Editor** → paste all of `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user** — your email + password for admin login.
4. **Settings → API** — copy:
   - Project URL
   - Publishable (anon) key
   - Service role key

---

## Step 2 — Local `.env.local` (sandbox)

Copy `.env.example` → `.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-SANDBOX-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAILS=your-email@gmail.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000

JOTFORM_WEBHOOK_SECRET=sandbox-jotform-secret-change-me
CRON_SECRET=sandbox-cron-secret-change-me

PAYPAL_ENVIRONMENT=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_SECRET

PAYMENT_EMAIL=your-test@gmail.com

RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=onboarding@resend.dev
EMAIL_REPLY_TO=your-email@gmail.com

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Notes:**
- `EMAIL_FROM_ADDRESS=onboarding@resend.dev` works for Resend testing **without** domain DNS. Emails only deliver to addresses on your Resend account until `myo.camp` is verified.
- Leave Google blank until you test e-Transfer matching (Step 8).

Run:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/admin` → sign in with the Supabase user you created.

---

## Step 3 — PayPal sandbox

1. [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/applications) → **Apps & Credentials**.
2. Tab: **Sandbox** (not Live).
3. Create app → copy **Client ID** + **Secret** into `.env.local`.
4. **Accounts** (left menu) → Sandbox business + personal test accounts exist by default.
5. Pay with the **personal** sandbox buyer on `/camp/pay/{ref}`.

---

## Step 4 — Resend sandbox (no DNS needed yet)

1. Sign up at [resend.com](https://resend.com).
2. **API Keys** → create key → `RESEND_API_KEY`.
3. For sandbox only: `EMAIL_FROM_ADDRESS=onboarding@resend.dev`.
4. Add your own email under **Audience** or verify it so test emails arrive.

Production: verify `myo.camp` (see [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md)).

---

## Step 5 — JotForm sandbox forms

1. Duplicate your real registration form → name it `MYO Camp SANDBOX Registration`.
2. Copy form ID from URL: `jotform.com/form/XXXXXXXX`.
3. Create a second sandbox waitlist form if testing full → waitlist flow.

**Webhook (local dev):** JotForm cannot reach `localhost`. Pick one:

### Option A — Vercel Preview (easiest)
1. Push branch to GitHub → Vercel creates preview URL e.g. `myocamp-git-sandbox-xxx.vercel.app`.
2. Set **Preview** env vars in Vercel (same sandbox Supabase keys).
3. JotForm webhook URL (from `/admin/setup` on preview):
   ```
   https://myocamp-git-sandbox-xxx.vercel.app/api/jotform-webhook?secret=YOUR_JOTFORM_WEBHOOK_SECRET
   ```

### Option B — ngrok (local)
```bash
ngrok http 3000
```
Webhook URL:
```
https://YOUR-NGROK-ID.ngrok.io/api/jotform-webhook?secret=YOUR_JOTFORM_WEBHOOK_SECRET
```

---

## Step 6 — Create sandbox camp in admin

1. `/admin/camps/new`
2. Example:
   - Title: `Sandbox Main Camp 2026`
   - Slug: `sandbox-main-2026`
   - Status: **Open**
   - Fee: `1` (easy to spot in tests)
   - Capacity: `5`
   - Registration JotForm ID: your sandbox form
   - Waitlist JotForm ID: sandbox waitlist form
   - Payment email: your test Gmail
   - Hero image: upload anything
3. Save → open `/camp/sandbox-main-2026/register` → confirm form embeds.

---

## Step 7 — End-to-end test checklist

Work through in order. Check each box in admin as you go.

### Admin access
- [ ] Sign in at `/admin`
- [ ] `/admin/setup` — Supabase + allowlist green

### Registration (JotForm → webhook)
- [ ] Submit sandbox JotForm with fake parent + camper data
- [ ] Registration appears in `/admin/camps/{slug}` → Registrations
- [ ] Invoice created with reference code `MYO-YYYY-XXXX`
- [ ] Email received (registration_received template) — check spam
- [ ] Re-submit same JotForm → no duplicate (idempotent)

### Payment page
- [ ] Open payment link from email or `/camp/pay/{ref}`
- [ ] PayPal sandbox button loads
- [ ] Complete sandbox payment → invoice status **paid**
- [ ] payment_confirmation email received
- [ ] Try **cash pledge** button → shows pledged in admin

### E-Transfer (manual match)
- [ ] `/admin/inbox` → **Simulate / manual match** (or forward test email)
- [ ] Match reference code + amount → invoice paid

### Waitlist
- [ ] Set camp status to **Full** (or fill capacity with test regs)
- [ ] Submit waitlist form → entry in admin waitlist tab
- [ ] **Promote** waitlist entry → claim email with token
- [ ] Open claim link → complete registration flow
- [ ] `/api/waitlist/sweep` — expire an overdue claim (or wait for cron on Vercel)

### Emails
- [ ] Edit template at `/admin/emails/{slug}` → save → preview updates
- [ ] **Send reminder now** on a registration → invoice_reminder sends
- [ ] **Pause reminders** on a registration → cron skips it

### Events + camps link
- [ ] `/admin/events` — create community event (no camp link) + camp session event (link to sandbox camp)
- [ ] `/events` — both show; camp event has registration panel
- [ ] Featured camp checkbox on camp → shows on `/events`

### Multi-camp picker
- [ ] Create second open camp
- [ ] `/camp/register` → picker UI
- [ ] Direct link to one camp → switch banner when 2+ open

### Capacity + deadlines
- [ ] Register until capacity → camp auto-flips to **Full**
- [ ] Set `registration_closes_at` in past → run `/api/camps/sweep?secret=CRON_SECRET` → camp **Closed**

### Content admin (no code)
- [ ] `/admin/events` — add/edit/delete events
- [ ] `/admin/blog` — add/edit posts
- [ ] Upload hero images (stored in Supabase `content-images`)

---

## Step 8 — Gmail e-Transfer auto-match (optional sandbox)

1. Google Cloud Console → new project `myocamp-sandbox`.
2. Enable **Gmail API**.
3. OAuth client → Web application.
4. Authorized redirect URI:
   - Local: `http://localhost:3000/api/gmail/oauth/callback`
   - Preview: `https://YOUR-PREVIEW.vercel.app/api/gmail/oauth/callback`
5. Put `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in env.
6. `/admin/setup/gmail` → Connect Gmail (use a test inbox).
7. Send yourself a fake Interac notification email (or use real small e-Transfer with reference in memo).
8. Trigger poll: `/admin/setup` → manual poll, or `GET /api/gmail/poll` with `Authorization: Bearer CRON_SECRET`.

---

## Step 9 — Cron jobs (Vercel Preview / Production only)

Crons in `vercel.json` **do not run on localhost**. Test on Vercel:

```bash
# Replace URL and secret
curl "https://YOUR-PREVIEW.vercel.app/api/reminders/sweep" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl "https://YOUR-PREVIEW.vercel.app/api/waitlist/sweep" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl "https://YOUR-PREVIEW.vercel.app/api/camps/sweep" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl "https://YOUR-PREVIEW.vercel.app/api/gmail/poll" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Requires **Vercel Pro** for scheduled crons. Hobby plan: manual curl only.

---

## Step 10 — Vercel Preview as full sandbox

Best “staging” setup:

1. Git branch: `sandbox` or use every PR preview.
2. Vercel → **Settings → Environment Variables** → set all vars under **Preview** only (sandbox Supabase, PayPal sandbox, etc.).
3. Production env vars stay empty or point to prod Supabase until launch.
4. Preview URL becomes your shared test link for Mahfouthi / team.

Set `NEXT_PUBLIC_SITE_URL` to the preview URL for that environment (payment links in emails will use it).

---

## Reset sandbox data

Safe ways to wipe test data in sandbox Supabase:

```sql
-- Run in Supabase SQL Editor (SANDBOX ONLY)
truncate payments, reminder_log, inbound_emails, waitlist_entries, invoices, registrations cascade;
-- Or delete one camp's data from admin → archive/delete draft camps
```

Never run this on production.

---

## When sandbox is green → production

1. New Supabase production project + run `schema.sql`.
2. Swap Vercel **Production** env vars to prod keys.
3. `PAYPAL_ENVIRONMENT=live` + live PayPal app.
4. Point JotForm webhooks to `https://myo.camp/api/jotform-webhook?secret=...`
5. Verify Resend on `myo.camp` (DNS — see [`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md)).
6. Mahfouthi points domain DNS to Vercel.
7. Re-create camps/events in production admin (or export/import if you add that later).

See [`SETUP.md`](SETUP.md) for the full launch split: what you do vs what Mahfouthi does.
