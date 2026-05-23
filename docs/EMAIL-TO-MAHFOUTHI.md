# Message for Mahfouthi — myo.camp DNS (WhatsApp)

Copy-paste. Website only.

---

Need DNS updated for myo.camp on Namespro:

**Delete whatever is there now for the website:**
- Remove the current **A record** on `@` (root) — whatever IP it points to now
- Remove the current **CNAME** on `www` — whatever it points to now
- If there's an old **A record on `www`** instead of CNAME, delete that too

**Add these (new site):**
- A → `@` → `216.198.79.1`
- CNAME → `www` → `d91ec05ed8078d1c.vercel-dns-017.com`

Don't touch MX or TXT records (email).

When done: exactly **one A on @** and **one CNAME on www**. No duplicates.

Lmk when saved — usually 15–60 min to go live.

---

After: Vercel domains turn green, then `https://myo.camp` works.
