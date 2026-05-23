import Link from "next/link";
import {
  ArrowSquareOut,
  CheckCircle,
  Database,
  Key,
  Lock,
  WarningCircle
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminAllowlist } from "@/lib/admin/allowlist";
import { hasSupabaseAuthEnv } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/content";

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

  const checks = {
    auth: hasSupabaseAuthEnv(),
    content: isSupabaseConfigured(),
    allowlist: getAdminAllowlist().length > 0
  };
  const allowlist = getAdminAllowlist();

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

      <section className="mt-8 grid gap-3 md:grid-cols-3">
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
        <p className="eyebrow text-brass">Database schema</p>
        <h2 className="mt-2 font-display text-xl tracking-tight text-ink">
          Run once in Supabase SQL Editor
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The canonical schema lives in <code className="border border-line bg-paper px-1 py-0.5 text-xs">supabase/schema.sql</code>.
          It creates three tables (<code className="border border-line bg-paper px-1 py-0.5 text-xs">content_events</code>,
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">content_blog_posts</code>,
          <code className="border border-line bg-paper px-1 py-0.5 text-xs">content_camp_settings</code>),
          adds <code className="border border-line bg-paper px-1 py-0.5 text-xs">updated_at</code> triggers,
          indexes, the singleton constraint, and the <code className="border border-line bg-paper px-1 py-0.5 text-xs">content-images</code> storage bucket. Idempotent — safe to re-run.
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
