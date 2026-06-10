# Mahfouthi — myo.camp setup

Log into **Namespro** → DNS for **myo.camp**.

---

## Website

**Remove** whatever is there now for the website:
- A record on `@`
- CNAME on `www` (or A on `www` if that’s what you have)

**Add:**

1. **A** — Name: `@` — Value: `216.198.79.1`
2. **CNAME** — Name: `www` — Value: `d91ec05ed8078d1c.vercel-dns-017.com`

---

## Camp emails (3 records)

1. **MX** — Name: `send.mail` — Value: `feedback-smtp.us-east-1.amazonses.com` — Priority: **10**

2. **TXT** — Name: `send.mail` — Value: `v=spf1 include:amazonses.com ~all`

3. **TXT** — Name: `resend._domainkey.mail` — Value:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZdMm/y0a4PjTDEb71z7TNSIb3W0C8cmq3RAM/usVUuKSQyJdB9nz7IaJ6skoXVY/CHqGZPkqDj6nSSRcUj7vdO6E2r0sCysILmc0snKl2jcLi0KMT3UUswWvu8ogD3UlxDhzKrviHsCr+4CgoKuS6VEoV12hVoccfJ2mQIDAQAB
```

---

## PayPal

Go to [developer.paypal.com](https://developer.paypal.com) → **Live** (not Sandbox) → create app **MYO Camp** → send us the **Client ID** and **Secret** on WhatsApp or email (not public).

---