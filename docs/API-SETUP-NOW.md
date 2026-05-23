# Get all APIs now (no DNS needed)

Do these in order. Supabase is already done. Copy each value into `.env.local` and restart `pnpm dev`.

Check progress at **http://localhost:3000/admin/setup** — pills turn green as you go.

---

## Already done ✓

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ |
| `ADMIN_EMAILS` | ✓ |
| `JOTFORM_WEBHOOK_SECRET` | ✓ generated |
| `CRON_SECRET` | ✓ generated |
| `PAYPAL_ENVIRONMENT` | ✓ `sandbox` |
| `EMAIL_FROM_ADDRESS` | ✓ `onboarding@resend.dev` (works without DNS) |

**Supabase admin user:** Dashboard → Authentication → Users → Add user → `admin@myo.ca` + password → **Auto Confirm User** on.

---

## 1. Resend (~5 min) — emails

1. Go to [resend.com/signup](https://resend.com/signup)
2. **API Keys → Create API Key** → copy key starting with `re_`
3. Paste into `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```
4. Leave `EMAIL_FROM_ADDRESS=onboarding@resend.dev` for now (sandbox — no DNS)
5. Add your personal email in Resend → **Audience** or verify it so test emails arrive
6. Restart dev server → `/admin/setup` Resend pill should be green

**Later (needs Mahfouthi DNS):** verify `myo.camp` in Resend, switch to `camp@myo.camp`

---

## 2. PayPal sandbox (~10 min) — online payments

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/applications)
2. Log in (create PayPal account if needed)
3. **Apps & Credentials** → tab **Sandbox** (not Live)
4. **Create App** → name it `MYO Camp Sandbox`
5. Copy **Client ID** and **Secret**
6. Paste into `.env.local`:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxx...
   PAYPAL_CLIENT_SECRET=EXxx...
   PAYPAL_ENVIRONMENT=sandbox
   ```
7. Restart dev server → `/admin/setup` PayPal pill green
8. Test buyer account: Sandbox → **Accounts** → use the personal test account PayPal creates

---

## 3. JotForm (~15 min) — registration forms

1. Go to [jotform.com](https://www.jotform.com) → sign in / create account
2. **Create form** → Registration (parent name, email, camper name, etc.)
3. Copy form ID from URL: `jotform.com/form/251234567890`
4. Optional: duplicate form → rename Waitlist form
5. In `/admin/camps/new` → paste Registration + Waitlist form IDs

### Webhook (needs public URL — localhost won't work)

**Option A — ngrok (fastest for local test):**
```bash
ngrok http 3000
```
Copy the `https://xxxx.ngrok.io` URL.

**Option B — Vercel preview** (after deploy): use preview URL.

In JotForm → form **Settings → Integrations → Webhooks**:
```
https://YOUR-PUBLIC-URL/api/jotform-webhook?secret=YOUR_JOTFORM_WEBHOOK_SECRET
```
(Use the secret from your `.env.local` — also shown on `/admin/setup`.)

Also copy this URL from `/admin/setup` on the public host.

---

## 4. Google Cloud (~15 min) — e-Transfer auto-match

Only needed if you want Gmail to auto-match Interac emails. Manual match in `/admin/inbox` works without this.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **New project** → name `myocamp`
3. **APIs & Services → Library** → search **Gmail API** → Enable
4. **APIs & Services → OAuth consent screen** → External → add your email as test user
5. **Credentials → Create Credentials → OAuth client ID** → Web application
6. **Authorized redirect URIs** — add BOTH:
   ```
   http://localhost:3000/api/gmail/oauth/callback
   ```
   (Add Vercel preview URL later when you deploy.)
7. Copy Client ID + Secret into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   ```
8. Restart → go to `/admin/setup/gmail` → **Connect Gmail**
9. Sign in with the inbox that receives e-Transfer notifications (e.g. `myoadmin@gmail.com`)

Set `PAYMENT_EMAIL` in `.env.local` to that same inbox.

---

## 5. Vercel (when ready to deploy)

1. Push repo to GitHub → import in [vercel.com](https://vercel.com)
2. **Settings → Environment Variables** — paste entire `.env.local` (except change `NEXT_PUBLIC_SITE_URL` to your Vercel URL or `https://myo.camp` later)
3. Redeploy
4. Update JotForm webhook URL to Vercel URL
5. Add Vercel preview URL to Google OAuth redirect URIs

---

## Quick test after each API

| API | Test |
|-----|------|
| Supabase | Sign in at `/admin` |
| Resend | Submit test registration → email arrives |
| PayPal | Open `/camp/pay/{ref}` → sandbox pay button works |
| JotForm | Submit form → registration in `/admin/camps/{slug}` |
| Gmail | `/admin/setup/gmail` connected + poll in setup page |
| Crons | `curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/reminders/sweep` |

---

## Blocked until Mahfouthi (DNS)

- Live site at `https://myo.camp`
- Email from `camp@myo.camp` (Resend domain verify)
- Production PayPal (`PAYPAL_ENVIRONMENT=live`)

See [DNS-FOR-MAHFOUTHI.md](DNS-FOR-MAHFOUTHI.md).
