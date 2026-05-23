# DNS setup for Mahfouthi — myo.camp

**Purpose:** Point `myo.camp` to the MYO Camp website (Vercel) and allow the site to send registration/payment emails (Resend).

**Who does what:**
- **You (MYO team):** Create Vercel + Resend accounts, add domain in each dashboard, copy the exact DNS values Resend gives you.
- **Mahfouthi:** Add/update DNS records at the domain registrar (likely **Namespro.ca** or wherever `myo.camp` is registered).

Send Mahfouthi this document plus the **Resend-specific values** from your Resend dashboard (they are unique per account — not listed here).

---

## Part 1 — Website (Vercel)

### 1A. Add domain in Vercel first

1. Log in to [vercel.com](https://vercel.com) → MYO Camp project.
2. **Settings → Domains → Add** → `myo.camp`.
3. Also add `www.myo.camp` (recommended).
4. Vercel shows **exact DNS records** required. Use those if they differ from below.

### 1B. Remove old website records first

Delete whatever **website** records exist today — the old host will be random IPs/names, not Vercel:

| Delete | Type | Name | Notes |
|--------|------|------|-------|
| Current root record | **A** | `@` | Whatever IP it points to now — remove it |
| Current www record | **CNAME** | `www` | Whatever target it points to now — remove it |
| If www uses A instead of CNAME | **A** | `www` | Some setups use A on www — delete if present |

Do **not** delete MX or TXT records (email).

### 1C. Add new records (from Vercel dashboard — May 2026)

| Type | Host / Name | Value | TTL | Notes |
|------|-------------|-------|-----|-------|
| **A** | `@` (or blank for apex) | `216.198.79.1` | 3600 (or Auto) | Replaces old `76.76.21.21` |
| **CNAME** | `www` | `d91ec05ed8078d1c.vercel-dns-017.com` | 3600 (or Auto) | Replaces old `cname.vercel-dns.com` |

Always prefer the values shown in **your** Vercel → Domains panel if they differ.

**If the registrar requires a trailing dot:** some panels want `d91ec05ed8078d1c.vercel-dns-017.com.` — follow registrar format.

**AAAA records:** Vercel usually handles IPv6 via the A record setup above. Only add AAAA if Vercel dashboard explicitly lists one.

### 1D. Alternative — Vercel nameservers (optional)

Instead of A + CNAME, Mahfouthi can delegate the whole zone to Vercel:

1. Vercel → Domains → `myo.camp` → **Nameservers** tab.
2. Copy Vercel nameservers (e.g. `ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
3. At registrar: replace existing nameservers with Vercel’s.

**Trade-off:** All DNS (website + email) is managed in Vercel. Resend records go in Vercel DNS instead of Namespro.

### 1E. Verify website

After DNS propagates (minutes to 48 hours):

- [ ] `https://myo.camp` loads the site
- [ ] `https://www.myo.camp` loads (or redirects to apex — configure in Vercel)
- [ ] Vercel Domains page shows **Valid Configuration** ✓
- [ ] SSL certificate issued (automatic on Vercel)

Check propagation:
```bash
nslookup myo.camp
nslookup www.myo.camp
```

---

## Part 2 — Outgoing email (Resend)

The site sends: registration confirmations, payment links, reminders, waitlist emails.

**From address (production):** `camp@myo.camp` (or similar — set in Vercel env `EMAIL_FROM_ADDRESS`).

### 2A. Add domain in Resend first

1. Log in to [resend.com](https://resend.com) → **Domains → Add Domain** → `myo.camp`.
2. Resend shows **3 required records** (exact values — copy from dashboard):

| Type | Host / Name | Value | Priority |
|------|-------------|-------|----------|
| **MX** | `send` | *(from Resend — e.g. `feedback-smtp.us-east-1.amazonses.com`)* | `10` |
| **TXT** | `send` | *(SPF — from Resend, starts with `v=spf1`)* | — |
| **TXT** | `resend._domainkey` | *(long DKIM string from Resend)* | — |

**Important for Mahfouthi:**
- Enter **`send`** not `send.myo.camp` if the panel auto-appends the domain.
- Enter **`resend._domainkey`** not the full FQDN if the panel auto-appends.
- Copy/paste values **exactly** — no extra quotes or spaces.
- Do **not** proxy email records through Cloudflare orange cloud (DNS only if using Cloudflare).

### 2B. Verify in Resend

1. After Mahfouthi saves records → Resend → Domains → **Verify DNS Records**.
2. Status should turn **Verified** (often 5–30 min, can take up to 72h).

Check from terminal:
```bash
nslookup -type=TXT resend._domainkey.myo.camp
nslookup -type=TXT send.myo.camp
nslookup -type=MX send.myo.camp
```

### 2C. Optional — receive bounces (advanced)

Only if Resend dashboard asks for **Receiving** / inbound MX on root — follow Resend’s extra records. Not required for basic send-only camp emails.

---

## Part 3 — Records NOT needed for this project

| Record | Needed? | Why |
|--------|---------|-----|
| Google Workspace MX | Only if you use `@myo.camp` **inbox** for email | Separate from Resend **send** subdomain |
| PayPal DNS | No | PayPal uses API keys only |
| JotForm DNS | No | Forms hosted on jotform.com |
| Supabase DNS | No | API calls only |

**E-Transfer payments** go to a regular Gmail inbox (e.g. `myoadmin@gmail.com`) — no DNS change for that. Gmail OAuth is configured in Google Cloud Console, not DNS.

---

## Part 4 — Google OAuth (not DNS — Mahfouthi or whoever owns Google Cloud)

If using Gmail auto-match for e-Transfers, add this **Authorized redirect URI** in Google Cloud Console (no DNS):

```
https://myo.camp/api/gmail/oauth/callback
```

For staging/preview, also add:
```
https://YOUR-PROJECT.vercel.app/api/gmail/oauth/callback
```

---

## Part 5 — Checklist for Mahfouthi (copy-paste)

```
MYO Camp — DNS changes for myo.camp

WEBSITE (Vercel) — replace old website records
□ DELETE current A record on @ (whatever IP — old host)
□ DELETE current CNAME on www (whatever target — old host)
□ DELETE A on www too if that's what exists instead of CNAME
□ ADD A record:  @  →  216.198.79.1
□ ADD CNAME:      www  →  d91ec05ed8078d1c.vercel-dns-017.com
   (Use exact values from Vercel dashboard if different)
□ Do NOT delete MX / TXT (email)

EMAIL (Resend — values from Resend dashboard, attached separately)
□ MX:   send  →  [VALUE FROM RESEND]  priority 10
□ TXT:  send  →  [SPF VALUE FROM RESEND]
□ TXT:  resend._domainkey  →  [DKIM VALUE FROM RESEND]

After adding:
□ Wait 15–60 minutes for propagation
□ Tell us when done so we can verify in Vercel + Resend dashboards
```

---

## Part 6 — What to attach when emailing Mahfouthi

1. This document ([`DNS-FOR-MAHFOUTHI.md`](DNS-FOR-MAHFOUTHI.md)).
2. Screenshot or export of **Resend → Domains → myo.camp → DNS records** (the 3 values).
3. Screenshot of **Vercel → Domains → myo.camp** if Vercel shows different A/CNAME than above.
4. Registrar login context: “DNS management for myo.camp at Namespro” (or correct registrar).

**Subject line suggestion:**
> DNS update needed for myo.camp — website (Vercel) + camp emails (Resend)

---

## Part 7 — Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Site not loading | A record wrong or not propagated | Re-check `76.76.21.21` on `@` |
| www broken | Missing CNAME | Add `www` → `cname.vercel-dns.com` |
| SSL error on Vercel | DNS not pointing to Vercel yet | Wait + verify domain in Vercel |
| Resend “domain not verified” | Typo in DKIM/SPF | Re-copy exact values from Resend |
| Emails go to spam | Domain not verified / no DKIM | Complete Resend verification first |
| Old website still shows | TTL / cache | Wait up to 48h; flush local DNS |

---

## Contact flow

1. You create Resend + Vercel domain entries → gather exact values.
2. Send Mahfouthi Part 5 checklist + Resend values.
3. Mahfouthi updates Namespro DNS.
4. You verify Vercel + Resend dashboards turn green.
5. Set production env: `EMAIL_FROM_ADDRESS=MYO Camp <camp@myo.camp>` and `NEXT_PUBLIC_SITE_URL=https://myo.camp`.
