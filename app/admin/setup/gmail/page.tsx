import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowSquareOut,
  CheckCircle,
  EnvelopeSimple,
  PaperPlaneTilt,
  PlugsConnected,
  WarningCircle,
  XCircle
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import {
  resolveAdminFlashState,
  type AdminSearchParams
} from "@/lib/admin/page-state";
import {
  fetchGmailCredentials,
  getRedirectUri,
  isGoogleOAuthConfigured
} from "@/lib/admin/gmail";
import { disconnectGmailAction, pollGmailNowAction } from "./actions";

export const dynamic = "force-dynamic";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  try {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return "just now";
    const mins = Math.floor(ms / 60_000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return new Date(iso).toLocaleString("en-CA");
  } catch {
    return iso;
  }
}

export default async function AdminGmailSetupPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "myo.camp";
  const proto =
    hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = getRedirectUri(origin);

  const configured = isGoogleOAuthConfigured();
  const creds = configured ? await fetchGmailCredentials() : null;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/setup"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Setup
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <p className="eyebrow text-brass flex items-center gap-2">
          <EnvelopeSimple size={14} weight="duotone" /> Gmail · e-Transfer matching
        </p>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">
          Connect the inbox that gets Interac notifications.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          We poll this Gmail account daily (and on demand) for Interac e-Transfer notification
          emails. When a parent's memo includes their <strong className="text-ink">
            MYO-YYYY-XXXX</strong>{" "}
          reference code, we auto-mark the invoice as paid. Anything ambiguous lands in{" "}
          <Link href="/admin/inbox" className="text-pine underline underline-offset-4">
            the inbox triage queue
          </Link>{" "}
          for one-click manual matching.
        </p>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-soft">
          Permission requested: <code className="border border-line bg-paper px-1 py-0.5">gmail.readonly</code> only.
          We never modify, mark, label, or delete your mail.
        </p>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      {!configured ? <NotConfiguredPanel redirectUri={redirectUri} /> : null}

      {configured && !creds ? <ConnectPanel redirectUri={redirectUri} /> : null}

      {creds ? <ConnectedPanel creds={creds} /> : null}

      <SetupGuide origin={origin} redirectUri={redirectUri} />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

function NotConfiguredPanel({ redirectUri }: { redirectUri: string }) {
  return (
    <section className="mt-6 border-2 border-ember/40 bg-ember/10 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <WarningCircle size={26} weight="duotone" className="mt-1 text-ember" />
        <div>
          <h2 className="font-display text-xl text-ink">Google OAuth not configured</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Add <code className="border border-line bg-paper px-1 py-0.5">GOOGLE_CLIENT_ID</code>{" "}
            and <code className="border border-line bg-paper px-1 py-0.5">GOOGLE_CLIENT_SECRET</code>{" "}
            to your env, then redeploy. Use the redirect URI:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="break-all border border-line bg-paper px-2 py-1 text-xs">
              {redirectUri}
            </code>
            <CopyButton value={redirectUri} label="Copy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectPanel({ redirectUri }: { redirectUri: string }) {
  return (
    <section className="mt-6 border border-pine/40 bg-sky/35 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <PlugsConnected size={26} weight="duotone" className="mt-1 text-forest" />
        <div className="flex-1">
          <h2 className="font-display text-xl text-ink">Ready to connect</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Google OAuth is configured. Click connect to grant{" "}
            <code className="border border-line bg-paper px-1 py-0.5">gmail.readonly</code>{" "}
            access. You'll be sent to Google to pick the account that receives Interac emails,
            then back here.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/api/gmail/oauth/start"
              className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
            >
              <PlugsConnected size={14} weight="bold" />
              Connect Gmail
            </a>
            <span className="self-center text-xs text-ink-soft">
              Redirect URI: <code className="border border-line bg-paper px-1 py-0.5">{redirectUri}</code>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectedPanel({
  creds
}: {
  creds: Awaited<ReturnType<typeof fetchGmailCredentials>>;
}) {
  if (!creds) return null;
  const heartbeatStale = isHeartbeatStale(creds.lastPolledAt);

  return (
    <section className="mt-6 border border-pine/40 bg-sky/35 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle size={26} weight="fill" className="mt-1 text-forest" />
        <div className="flex-1">
          <h2 className="font-display text-xl text-ink">
            Connected to <span className="font-mono">{creds.email}</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Polling every 5 minutes for Interac e-Transfer notifications. Reference-code
            matches auto-mark their invoice; everything else routes to{" "}
            <Link href="/admin/inbox" className="text-pine underline underline-offset-4">
              /admin/inbox
            </Link>
            .
          </p>

          <dl className="mt-4 grid gap-3 md:grid-cols-4">
            <Stat
              label="Last poll"
              value={timeAgo(creds.lastPolledAt)}
              tone={
                creds.lastPolledStatus === "error" || heartbeatStale ? "warn" : "ok"
              }
            />
            <Stat
              label="Poll status"
              value={creds.lastPolledStatus ?? "never"}
              tone={creds.lastPolledStatus === "error" ? "warn" : "ok"}
            />
            <Stat label="Last seen" value={String(creds.lastMessagesSeen)} />
            <Stat label="Last matched" value={String(creds.lastMessagesMatched)} tone="ok" />
          </dl>

          {creds.lastPolledError ? (
            <div className="mt-3 border border-ember/40 bg-ember/10 p-3 text-xs text-ember">
              <strong>Last error:</strong> {creds.lastPolledError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <form action={pollGmailNowAction}>
              <AdminSubmitButton
                idleLabel="Poll now"
                pendingLabel="Polling…"
                icon={<PaperPlaneTilt size={14} weight="bold" />}
              />
            </form>
            <form action={disconnectGmailAction}>
              <input type="hidden" name="email" value={creds.email} />
              <AdminSubmitButton
                idleLabel="Disconnect"
                variant="danger"
                icon={<XCircle size={14} weight="bold" />}
              />
            </form>
            <Link
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              Revoke at Google
              <ArrowSquareOut size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function isHeartbeatStale(lastPolledAt: string | null): boolean {
  if (!lastPolledAt) return true;
  return Date.now() - new Date(lastPolledAt).getTime() > 30 * 60 * 1000;
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const toneClass = tone === "ok" ? "text-forest" : tone === "warn" ? "text-ember" : "text-ink";
  return (
    <div className="border border-line bg-paper p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      <p className={`mt-1 font-display text-base ${toneClass}`}>{value}</p>
    </div>
  );
}

function SetupGuide({ origin, redirectUri }: { origin: string; redirectUri: string }) {
  return (
    <section className="mt-8 border border-line bg-paper-deep/35 p-6 md:p-8">
      <p className="eyebrow text-brass">Google Cloud setup (one-time, ~10 min)</p>
      <h2 className="mt-2 font-display text-xl tracking-tight text-ink">First time setup</h2>
      <ol className="mt-5 space-y-4 text-sm leading-relaxed text-ink">
        <li>
          <strong>1.</strong> Open the{" "}
          <Link
            href="https://console.cloud.google.com/projectcreate"
            target="_blank"
            rel="noreferrer"
            className="text-pine underline underline-offset-4"
          >
            Google Cloud Console
          </Link>{" "}
          and create a new project (or pick an existing one).
        </li>
        <li>
          <strong>2.</strong> Enable the{" "}
          <Link
            href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
            target="_blank"
            rel="noreferrer"
            className="text-pine underline underline-offset-4"
          >
            Gmail API
          </Link>{" "}
          for that project.
        </li>
        <li>
          <strong>3.</strong> Go to <em>APIs &amp; Services → OAuth consent screen</em>, choose{" "}
          <code className="border border-line bg-paper px-1 py-0.5">External</code>, name the
          app (e.g. "MYO E-Transfer Watcher"), and add the owner's Gmail address as a{" "}
          <em>test user</em>.
        </li>
        <li>
          <strong>4.</strong> Add the scope{" "}
          <code className="border border-line bg-paper px-1 py-0.5">
            https://www.googleapis.com/auth/gmail.readonly
          </code>
          .
        </li>
        <li>
          <strong>5.</strong> Go to <em>APIs &amp; Services → Credentials → Create credentials → OAuth client ID</em>.
          Pick <code className="border border-line bg-paper px-1 py-0.5">Web application</code>.
          Add these:
          <div className="mt-2 space-y-2 border-l-2 border-pine/30 pl-3 text-xs">
            <div>
              Authorized JavaScript origin: <code className="break-all border border-line bg-paper px-1 py-0.5">{origin}</code>
              <CopyButton value={origin} label="Copy" className="ml-2 inline-flex h-6 items-center gap-1 border border-line bg-paper px-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:border-pine hover:text-ink" />
            </div>
            <div>
              Authorized redirect URI: <code className="break-all border border-line bg-paper px-1 py-0.5">{redirectUri}</code>
              <CopyButton value={redirectUri} label="Copy" className="ml-2 inline-flex h-6 items-center gap-1 border border-line bg-paper px-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:border-pine hover:text-ink" />
            </div>
          </div>
        </li>
        <li>
          <strong>6.</strong> Copy the Client ID + Client Secret into your env vars:
          <pre className="mt-2 overflow-x-auto border border-line bg-paper p-3 text-xs">
{`GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
# Optional: a shared secret for non-Vercel-cron pollers
CRON_SECRET=…`}
          </pre>
        </li>
        <li>
          <strong>7.</strong> Redeploy, then come back here and click <strong>Connect Gmail</strong>.
        </li>
      </ol>
    </section>
  );
}
