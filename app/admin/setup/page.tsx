import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowSquareOut,
  CheckCircle,
  Clock,
  Database,
  EnvelopeSimple,
  Key,
  Lock,
  Wallet,
  WebhooksLogo,
  WarningCircle
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminAllowlist } from "@/lib/admin/allowlist";
import { hasSupabaseAuthEnv } from "@/lib/admin/auth";
import { fetchGmailCredentials, isGoogleOAuthConfigured } from "@/lib/admin/gmail";
import { getPayPalEnvironment, isPayPalConfigured } from "@/lib/admin/paypal";
import { isResendConfigured } from "@/lib/email/resend";
import { isSupabaseConfigured } from "@/lib/supabase/content";

import {
  closeOverdueCampsAction,
  expireWaitlistClaimsAction,
  pollGmailNowAction,
  runDailyCronAction,
  sendPaymentRemindersAction
} from "./actions";

export const dynamic = "force-dynamic";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
        ok
          ? "border-pine/30 bg-sky/55 text-forest"
          : "border-ember/40 bg-ember/10 text-ember"
      }`}
    >
      {ok ? <CheckCircle size={12} weight="bold" /> : <WarningCircle size={12} weight="bold" />}
      {ok ? "Ready" : "Missing"}
    </span>
  );
}

export default async function AdminSetupPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  // Derive the public webhook URL from the incoming request headers
  // (works locally and in Vercel, both http and https).
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "myo.camp";
  const proto = hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const webhookSecret = process.env.JOTFORM_WEBHOOK_SECRET ?? "";
  const webhookUrl =
    `${proto}://${host}/api/jotform-webhook` +
    (webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : "");

  const gmailCreds = await fetchGmailCredentials().catch(() => null);
  const checks = {
    auth: hasSupabaseAuthEnv(),
    content: isSupabaseConfigured(),
    allowlist: getAdminAllowlist().length > 0,
    paypal: isPayPalConfigured(),
    gmail: isGoogleOAuthConfigured() && Boolean(gmailCreds),
    resend: isResendConfigured()
  };
  const allowlist = getAdminAllowlist();
  const paypalEnv = getPayPalEnvironment();

  const envRows = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hint: "Your project URL (https://xxx.supabase.co)."
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      hint: "New-style publishable key. Safe in the browser.",
      mask: true
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hint: "Legacy anon key. Use either this or the publishable key.",
      mask: true
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      hint: "Server-only. Bypasses RLS. Never expose to the browser.",
      mask: true
    },
    {
      name: "ADMIN_EMAILS",
      value: process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL,
      hint: "Comma-separated allowlist of admin emails."
    },
    {
      name: "JOTFORM_WEBHOOK_SECRET",
      value: process.env.JOTFORM_WEBHOOK_SECRET,
      hint: "Optional shared secret for the JotForm webhook URL. Recommended in production.",
      mask: true
    },
    {
      name: "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
      value: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      hint: "PayPal app Client ID. Loaded into the browser SDK on /camp/pay/[ref]."
    },
    {
      name: "PAYPAL_CLIENT_SECRET",
      value: process.env.PAYPAL_CLIENT_SECRET,
      hint: "PayPal app secret. Server-only — used to create + capture orders.",
      mask: true
    },
    {
      name: "PAYPAL_ENVIRONMENT",
      value: process.env.PAYPAL_ENVIRONMENT ?? "sandbox",
      hint: "'sandbox' for testing, 'live' for production. Defaults to sandbox."
    },
    {
      name: "PAYMENT_EMAIL",
      value: process.env.PAYMENT_EMAIL,
      hint: "Default e-Transfer destination. Per-camp override goes in camps.data.paymentEmail."
    },
    {
      name: "GOOGLE_CLIENT_ID",
      value: process.env.GOOGLE_CLIENT_ID,
      hint: "Google OAuth client id (Web app). Used to grant Gmail read access."
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      value: process.env.GOOGLE_CLIENT_SECRET,
      hint: "Google OAuth client secret. Server-only.",
      mask: true
    },
    {
      name: "CRON_SECRET",
      value: process.env.CRON_SECRET,
      hint: "Bearer secret for manual cron runs from admin or curl.",
      mask: true
    },
    {
      name: "RESEND_API_KEY",
      value: process.env.RESEND_API_KEY,
      hint: "API key from https://resend.com/api-keys. Powers every automated email.",
      mask: true
    },
    {
      name: "EMAIL_FROM_ADDRESS",
      value: process.env.EMAIL_FROM_ADDRESS,
      hint: 'Verified From address, e.g. "MYO Camp <camp@myo.camp>".'
    },
    {
      name: "EMAIL_REPLY_TO",
      value: process.env.EMAIL_REPLY_TO,
      hint: "Optional. Where parents' replies land. Defaults to the From address."
    }
  ];

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Setup</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">Connection checklist.</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Environment health, allowlist, and the SQL schema your Supabase project needs.
              Anything missing falls back to seed content in <code className="border border-line bg-paper px-1 py-0.5 text-xs">lib/content/</code>.
            </p>
          </div>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <Lock size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Auth</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Supabase URL + anon/publishable key for the sign-in flow.
            </p>
          </div>
          <StatusPill ok={checks.auth} label="Auth" />
        </div>

        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <Database size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Content</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Service role key for server-side reads and writes.
            </p>
          </div>
          <StatusPill ok={checks.content} label="Content" />
        </div>

        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <Key size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Allowlist</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {checks.allowlist
                ? `${allowlist.length} email${allowlist.length === 1 ? "" : "s"} permitted.`
                : "No emails set — anyone with a Supabase account can sign in."}
            </p>
          </div>
          <StatusPill ok={checks.allowlist} label="Allowlist" />
        </div>

        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <Wallet size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">PayPal</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {checks.paypal
                ? `Connected · ${paypalEnv} mode.`
                : "Add NEXT_PUBLIC_PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET to enable Smart Buttons."}
            </p>
          </div>
          <StatusPill ok={checks.paypal} label="PayPal" />
        </div>

        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5 xl:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <EnvelopeSimple size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                Gmail (e-Transfer auto-match)
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {checks.gmail
                ? `Connected to ${gmailCreds!.email}. Polls daily via Vercel Cron — or use Poll now anytime.`
                : isGoogleOAuthConfigured()
                  ? "OAuth configured but no inbox connected. Visit Gmail setup to connect."
                  : "Add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET, then connect an inbox."}
            </p>
            <Link
              href="/admin/setup/gmail"
              className="mt-3 inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              Open Gmail setup
              <ArrowSquareOut size={11} weight="bold" />
            </Link>
          </div>
          <StatusPill ok={checks.gmail} label="Gmail" />
        </div>

        <div className="flex items-start justify-between gap-3 border border-line bg-paper-deep/35 p-5 xl:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-pine">
              <EnvelopeSimple size={18} weight="duotone" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                Resend (outgoing email)
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {checks.resend
                ? `Sending from ${process.env.EMAIL_FROM_ADDRESS}. Templates are edited in /admin/emails.`
                : "Add RESEND_API_KEY + EMAIL_FROM_ADDRESS to power registration receipts, reminders, waitlist promotions, and payment confirmations."}
            </p>
            <Link
              href="/admin/emails"
              className="mt-3 inline-flex h-8 items-center gap-1.5 border border-line bg-paper px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              Edit email templates
              <ArrowSquareOut size={11} weight="bold" />
            </Link>
          </div>
          <StatusPill ok={checks.resend} label="Resend" />
        </div>
      </section>

      <section className="mt-8 border border-line bg-paper-deep/35 p-6 md:p-8">
        <p className="eyebrow text-brass">Environment variables</p>
        <h2 className="mt-2 font-display text-xl tracking-tight text-ink">
          Detected in this server runtime
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                <th className="py-2 pr-4">Variable</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {envRows.map((row) => {
                const present = Boolean(row.value);
                const display = !row.value
                  ? "—"
                  : row.mask
                    ? `${row.value.slice(0, 6)}…${row.value.slice(-4)}`
                    : row.value;
                return (
                  <tr key={row.name} className="border-b border-line/60 align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-ink">{row.name}</td>
                    <td className="py-3 pr-4">
                      <StatusPill ok={present} label={present ? "Set" : "Missing"} />
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-ink-soft">{display}</td>
                    <td className="py-3 text-xs leading-relaxed text-ink-soft">{row.hint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 border border-line bg-paper-deep/35 p-6 md:p-8">
        <p className="eyebrow text-brass flex items-center gap-2">
          <WebhooksLogo size={14} weight="duotone" /> JotForm webhook
        </p>
        <h2 className="mt-2 font-display text-xl tracking-tight text-ink">
          Point JotForm at this URL
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Paste this into{" "}
          <strong>Settings → Integrations → Webhooks</strong> on every form you use
          (registration and waitlist). MYO will match each submission to a camp via the form
          ID you set in <Link href="/admin/camps" className="text-pine underline underline-offset-4">camp settings</Link>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="break-all border border-line bg-paper px-3 py-2 text-xs text-ink">
            {webhookUrl}
          </code>
          <CopyButton
            value={webhookUrl}
            label="Copy URL"
            className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          />
          <Link
            href="/api/jotform-webhook"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            Health check
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          {webhookSecret
            ? "✓ Secret is set — only requests with this URL (or the x-jotform-secret header) are accepted."
            : "No JOTFORM_WEBHOOK_SECRET set. For production, set one in your env vars so only JotForm can hit this URL."}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Also set each form&apos;s <strong>Thank You Page</strong> to redirect to MYO (see the
          redirect URL on each camp&apos;s Settings tab). Parents land on the payment page right
          after submit — no email required.
        </p>
      </section>

      <section className="mt-8 border border-line bg-paper-deep/35 p-6 md:p-8">
        <p className="eyebrow text-brass flex items-center gap-2">
          <Clock size={14} weight="duotone" /> Scheduled jobs
        </p>
        <h2 className="mt-2 font-display text-xl tracking-tight text-ink">
          Run cron jobs manually
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          On Vercel Hobby, everything in <code className="border border-line bg-paper px-1 py-0.5 text-xs">/api/cron/daily</code> runs
          automatically once per day at 2pm UTC. Use these buttons anytime you need results sooner —
          same code paths as the cron.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <form action={runDailyCronAction}>
            <AdminSubmitButton idleLabel="Run all daily jobs" />
          </form>
          <form action={pollGmailNowAction}>
            <AdminSubmitButton idleLabel="Poll Gmail" variant="secondary" />
          </form>
          <form action={expireWaitlistClaimsAction}>
            <AdminSubmitButton idleLabel="Expire waitlist claims" variant="secondary" />
          </form>
          <form action={closeOverdueCampsAction}>
            <AdminSubmitButton idleLabel="Close overdue camps" variant="secondary" />
          </form>
          <form action={sendPaymentRemindersAction}>
            <AdminSubmitButton idleLabel="Send payment reminders" variant="secondary" />
          </form>
        </div>
        <ul className="mt-5 space-y-2 text-xs leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">Poll Gmail</strong> — check for new Interac e-transfers and auto-match invoices.
            Undo: match payments manually in Inbox / registration detail.
          </li>
          <li>
            <strong className="text-ink">Expire waitlist claims</strong> — parents promoted off the waitlist get 48h to register; this marks missed deadlines as expired.
            Undo: <strong className="text-ink">Re-add</strong> on the camp waitlist tab.
          </li>
          <li>
            <strong className="text-ink">Close overdue camps</strong> — flips camps to closed when their registration deadline has passed.
            Undo: <strong className="text-ink">Reopen registration</strong> on the camp page (clears the deadline so cron won&apos;t re-close).
          </li>
          <li>
            <strong className="text-ink">Send payment reminders</strong> — T-7 / T-3 / T-1 emails for unpaid invoices before camp starts.
            Cannot undo sent emails; pause reminders per registration if needed.
          </li>
        </ul>
      </section>

      <section className="mt-8 border border-line bg-paper-deep/35 p-6 md:p-8">
        <p className="eyebrow text-brass">Database schema</p>
        <h2 className="mt-2 font-display text-xl tracking-tight text-ink">
          Run once in Supabase SQL Editor
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The canonical schema lives in <code className="border border-line bg-paper px-1 py-0.5 text-xs">supabase/schema.sql</code>.
          It creates the content tables (<code className="border border-line bg-paper px-1 py-0.5 text-xs">content_events</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">content_blog_posts</code>,
          <code className="border border-line bg-paper px-1 py-0.5 text-xs">content_camp_settings</code>)
          plus the registration pipeline (<code className="border border-line bg-paper px-1 py-0.5 text-xs">camps</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">registrations</code>,
          <code className="border border-line bg-paper px-1 py-0.5 text-xs">invoices</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">payments</code>,
          <code className="border border-line bg-paper px-1 py-0.5 text-xs">waitlist_entries</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">inbound_emails</code>,
          <code className="border border-line bg-paper px-1 py-0.5 text-xs">reminder_log</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">email_templates</code>),
          adds <code className="border border-line bg-paper px-1 py-0.5 text-xs">updated_at</code> triggers,
          indexes, RLS, and the <code className="border border-line bg-paper px-1 py-0.5 text-xs">content-images</code> storage bucket. Idempotent — safe to re-run.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 bg-forest px-4 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
          >
            Open Supabase dashboard
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center gap-2 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  );
}
