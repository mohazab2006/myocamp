# Mahfouthi meeting runbook

Share screen. Do **DNS first** (he does it live), then **admin tour**, then **PayPal + Gmail** if time allows.

---

## Before the call (you)

- [ ] Vercel open → Domains → `myo.camp` (screenshot ready)
- [ ] Resend open → Domains → `mail.myo.camp` (3 DNS records visible)
- [ ] `docs/MAHFOUTHI.md` open or sent on WhatsApp
- [ ] Admin login works: `https://myo.camp/admin` (or Vercel URL if DNS not live yet)
- [ ] His email is in `ADMIN_EMAILS` + Supabase Auth user exists

---

## Part 1 — DNS (~15 min) — he does this, you watch

1. Log into **Namespro** → DNS for **myo.camp**
2. **Website** — delete old `@` A and `www` CNAME, then add:
   - A `@` → `216.198.79.1`
   - CNAME `www` → `d91ec05ed8078d1c.vercel-dns-017.com`
3. **Email (Resend)** — add 3 records from `MAHFOUTHI.md`:
   - MX `send.mail` → `feedback-smtp.us-east-1.amazonses.com` (priority 10)
   - TXT `send.mail` → SPF line
   - TXT `resend._domainkey.mail` → DKIM long string
4. **Resend:** Sending only — **not** Receiving
5. Save → you verify:
   - Vercel Domains → green
   - Resend → Verify DNS → green
   - `https://myo.camp` loads in incognito

**Tell him:** text when done — usually 15–60 minutes.

---

## Part 2 — Public site quick look (~5 min)

| URL | What it is |
|-----|------------|
| `myo.camp` | Homepage (events teaser — not auto camp cards) |
| `myo.camp/events` | Featured camp (top) + event list |
| `myo.camp/camp` | Camp info page |
| `myo.camp/camp/register` | Where parents register (when camp is **Open**) |

**Key line:** Creating a camp doesn’t put it on the homepage. **Open** camp → featured on `/events` automatically. Optional: add an **Event** in admin for a card in the list below.

---

## Part 3 — Admin login + tour (~20 min)

**Login:** `myo.camp/admin` → his email + password

### 1. Dashboard (`/admin`)
Stats, quick links, Gmail poll warning if stale

### 2. Camps (`/admin/camps`)
- **New camp:** title, dates, fee, capacity, JotForm IDs, hero image
- **Status:** Draft → **Open** when ready (registration live + auto-featured on `/events`)
- **Uncheck “Feature on events”** if he doesn’t want it promoted
- Open a camp → **Registrations** tab
- **Waitlist** tab → **Promote** sends claim email
- **Settings** tab → JotForm IDs, reopen if closed

### 3. One registration (`/admin/camps/{slug}/registrations/{id}`)
- Parent info, invoice, reference code
- **Send registration email** / **Send reminder**
- **Cancel** (frees a spot if full)
- **Record cash** payment
- Full JotForm answers at bottom

### 4. Inbox (`/admin/inbox`)
- e-Transfers that didn’t auto-match
- Match to reference code or **Remove** if not payment

### 5. Emails (`/admin/emails`)
- Edit wording for registration, reminders, waitlist, payment confirmation

### 6. Events (`/admin/events`) — optional
- Community events + camp event pages
- Link **camp slug** so event card connects to registration

### 7. Blog (`/admin/blog`) — optional
- Posts for `/blog`

### 8. Setup (`/admin/setup`)
- Green pills = Resend, PayPal, etc.
- **JotForm webhook URL** → `https://myo.camp/api/jotform-webhook?secret=...`
- **Run daily jobs** / **Poll Gmail** for testing

---

## Part 4 — Gmail for e-Transfers (~10 min)

1. **`/admin/setup/gmail`**
2. **Connect Gmail** → inbox that gets Interac emails (e.g. `myoadmin@gmail.com`)
3. Whole account is searched — not just Primary tab
4. **Poll Gmail now** → check `/admin/inbox`

If OAuth fails: Google Cloud needs `https://myo.camp` + callback URL.

---

## Part 5 — PayPal Live (~10 min)

1. [developer.paypal.com](https://developer.paypal.com) → **Live** (not Sandbox)
2. Create app **MYO Camp**
3. Copy **Client ID + Secret** → Vercel env:
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENVIRONMENT=live`
4. Redeploy → test pay on a registration

---

## Part 6 — End-to-end test (~10 min)

1. Camp **Open** + JotForm ID set
2. Submit test registration
3. Check admin → registration appears
4. Parent email from `camp@mail.myo.camp`
5. Pay link → PayPal or e-Transfer memo (reference + camper name)
6. (Optional) Poll Gmail after test e-Transfer

---

## Who owns what after the call

| Task | Who |
|------|-----|
| DNS at Namespro | Mahfouthi |
| PayPal Live keys | Mahfouthi → you |
| Gmail connect | Mahfouthi |
| Create camps, open registration | Mahfouthi |
| Edit email templates | Mahfouthi |
| Match odd e-Transfers in Inbox | Mahfouthi |
| Vercel env, JotForm webhook, Resend | You |

---

## Quick answers if he asks

- **Where do parents register?** → `/camp/register` or featured card on `/events`
- **Homepage camp card?** → No — use Events featured or create an Event
- **Full camp, someone cancels?** → Auto back to Open if auto-close at capacity is on
- **Email when someone signs up?** → No — check admin; parents get the email
- **Cron?** → Daily on Vercel; manual run on Setup

---

## If DNS isn’t live yet

Do admin tour on **Vercel URL**. DNS + `myo.camp` + JotForm webhook + Gmail OAuth wait until DNS is green.

Send **`docs/MAHFOUTHI.md`** on WhatsApp before or during the call.
