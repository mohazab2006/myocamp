import Link from "next/link";
import {
  ArrowSquareOut,
  CalendarBlank,
  CheckCircle,
  FileText,
  Lock,
  SlidersHorizontal,
  Tent,
  WarningCircle
} from "@phosphor-icons/react/ssr";

import { AdminField, adminInputClass } from "@/components/admin/field";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { getBlogPosts } from "@/lib/content/blog";
import { getCampSettings } from "@/lib/content/camp";
import { getEvents } from "@/lib/content/events";
import { getAdminSession, hasSupabaseAuthEnv } from "@/lib/admin/auth";
import {
  resolveAdminFlashState,
  type AdminSearchParams
} from "@/lib/admin/page-state";
import { isSupabaseConfigured } from "@/lib/supabase/content";
import type { User } from "@supabase/supabase-js";

import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    href: "/admin/events",
    label: "Events",
    description: "Add, edit, archive, or delete public event pages.",
    icon: CalendarBlank
  },
  {
    href: "/admin/blog",
    label: "Blog posts",
    description: "Write recaps, news, and stories for the /blog feed.",
    icon: FileText
  },
  {
    href: "/admin/camp",
    label: "Camp",
    description: "Flip the registration status badge that runs across /camp.",
    icon: Tent
  },
  {
    href: "/admin/setup",
    label: "Setup",
    description: "Connection checklist, env vars, and Supabase health.",
    icon: SlidersHorizontal
  }
] as const;

function firstName(email: string) {
  const local = email.split("@")[0] ?? email;
  const segment = local.split(/[._+-]/)[0] ?? local;
  if (!segment) return "friend";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default async function AdminOverviewPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  const session = await getAdminSession();
  const { message, type } = await resolveAdminFlashState(searchParams);

  if (!hasSupabaseAuthEnv() || session.status === "unconfigured") {
    return <UnconfiguredView message={message} type={type} />;
  }
  if (session.status === "forbidden") {
    return <ForbiddenView email={session.user.email ?? ""} message={message} type={type} />;
  }
  if (session.status === "anonymous") {
    return <SignInView message={message} type={type} />;
  }

  return <DashboardView user={session.user} message={message} type={type} />;
}

async function DashboardView({
  user,
  message,
  type
}: {
  user: User;
  message: string | null;
  type: "success" | "error" | "info" | null;
}) {
  const [events, posts, camp] = await Promise.all([
    getEvents(),
    getBlogPosts(),
    getCampSettings()
  ]);
  const supabaseContentConnected = isSupabaseConfigured();
  const liveEvents = events.filter((event) => !event.archived).length;

  const stats = [
    { label: "Live events", value: String(liveEvents), icon: CalendarBlank },
    { label: "Blog posts", value: String(posts.length), icon: FileText },
    { label: "Camp status", value: camp.registrationStatus.replace("-", " "), icon: Tent }
  ];

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <AdminFlashBanner message={message} type={type} className="mb-8" />

      <div className="grid gap-3">
        <span className="eyebrow text-brass">Dashboard</span>
        <h1 className="headline-display text-4xl md:text-5xl">
          Salaam, {firstName(user.email ?? "friend")}.
        </h1>
        <p className="max-w-[60ch] text-sm leading-relaxed text-ink-soft md:text-base">
          Edit live site content, manage the blog, and flip the camp registration badge from here.
          Saves publish to the public site immediately. Signed in as{" "}
          <span className="text-ink">{user.email}</span>.
        </p>
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between border border-line bg-paper-deep/35 p-4"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-ink-soft">{stat.label}</p>
                <p className="mt-1 font-display text-2xl tracking-tight text-ink capitalize">
                  {stat.value}
                </p>
              </div>
              <Icon size={28} weight="duotone" className="text-pine" />
            </div>
          );
        })}
      </section>

      <section className="mt-10">
        <p className="eyebrow text-brass">Quick actions</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col gap-4 border border-line bg-paper-deep/35 p-5 transition hover:-translate-y-0.5 hover:border-pine hover:bg-paper-deep/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-line bg-paper text-pine">
                    <Icon size={20} weight="duotone" />
                  </div>
                  <ArrowSquareOut
                    size={14}
                    weight="bold"
                    className="text-ink-soft transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
                <div>
                  <p className="font-display text-xl tracking-tight text-ink">{action.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-3 md:grid-cols-2">
        <div
          className={`border p-5 ${
            supabaseContentConnected
              ? "border-pine/30 bg-sky/55 text-forest"
              : "border-ember/40 bg-ember/10 text-ink"
          }`}
        >
          <div className="flex items-center gap-2">
            {supabaseContentConnected ? (
              <CheckCircle size={18} weight="duotone" />
            ) : (
              <WarningCircle size={18} weight="duotone" />
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Supabase content</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            {supabaseContentConnected
              ? "Connected. Reads and writes go to your Supabase tables — the public site reflects the latest changes."
              : "Not connected. Add SUPABASE_SERVICE_ROLE_KEY (server) so writes persist. The site is currently serving seed content from lib/content/."}
          </p>
        </div>

        <div className="border border-line bg-paper-deep/35 p-5">
          <div className="flex items-center gap-2 text-ink">
            <Lock size={18} weight="duotone" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Account</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            You&apos;re signed in as <span className="text-ink">{user.email}</span>. Use the
            navigation above to jump into a section. Sign out from the top right when finished.
          </p>
        </div>
      </section>
    </main>
  );
}

function SignInView({
  message,
  type
}: {
  message: string | null;
  type: "success" | "error" | "info" | null;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-[520px] flex-col justify-center px-5 py-12 md:px-8">
      <AdminFlashBanner message={message} type={type} className="mb-6" />
      <div className="border border-line bg-paper-deep/45 p-8 md:p-10">
        <p className="eyebrow text-brass">Admin access</p>
        <h1 className="headline-display mt-4 text-3xl md:text-4xl">Sign in to the dashboard.</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Use your MYO admin email and the password set in Supabase Auth.
        </p>

        <form action={loginAction} className="mt-7 grid gap-4">
          <AdminField label="Email" required>
            <input
              className={adminInputClass}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </AdminField>
          <AdminField label="Password" required>
            <input
              className={adminInputClass}
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </AdminField>
          <div className="mt-2">
            <AdminSubmitButton
              idleLabel="Sign in"
              pendingLabel="Signing in…"
              icon={<Lock size={16} weight="bold" />}
              className="w-full"
            />
          </div>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-ink-soft">
        Looking for the public site?{" "}
        <Link href="/" className="text-pine underline underline-offset-4 hover:text-forest">
          Back to MYO
        </Link>
      </p>
    </main>
  );
}

function ForbiddenView({
  email,
  message,
  type
}: {
  email: string;
  message: string | null;
  type: "success" | "error" | "info" | null;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-[560px] flex-col justify-center px-5 py-12 md:px-8">
      <AdminFlashBanner message={message} type={type} className="mb-6" />
      <div className="border border-ember/40 bg-ember/10 p-8 md:p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ember">
          Access denied
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink md:text-4xl">
          This email isn&apos;t on the allowlist.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          You&apos;re signed in as <span className="text-ink">{email}</span>, but that address isn&apos;t in
          <code className="mx-1 border border-line bg-paper px-1 py-0.5 text-xs">ADMIN_EMAILS</code>.
          Ask an owner to add it, or sign out and try a different address.
        </p>
      </div>
    </main>
  );
}

function UnconfiguredView({
  message,
  type
}: {
  message: string | null;
  type: "success" | "error" | "info" | null;
}) {
  const steps = [
    "Create a Supabase project at supabase.com and run supabase/schema.sql in the SQL Editor.",
    "Copy .env.example → .env.local and fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    "Set ADMIN_EMAILS to the comma-separated list of owner emails who may sign in.",
    "In Supabase → Authentication → Users, create an account with each admin email.",
    "Restart pnpm dev, revisit /admin, and sign in with the email + password you created."
  ];

  return (
    <main className="mx-auto max-w-[760px] px-5 py-12 md:px-8 md:py-16">
      <AdminFlashBanner message={message} type={type} className="mb-8" />
      <p className="eyebrow text-brass">Setup required</p>
      <h1 className="headline-display mt-3 text-4xl md:text-5xl">
        Connect Supabase to activate the admin.
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-ink-soft md:text-base">
        The editors and auth are wired up — they just need a Supabase project to talk to.
        Follow the checklist below to bring the dashboard online.
      </p>
      <ol className="mt-8 grid gap-3">
        {steps.map((step, idx) => (
          <li
            key={step}
            className="flex gap-4 border border-line bg-paper-deep/35 p-5 text-sm leading-relaxed text-ink-soft"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-forest text-xs font-semibold text-paper">
              {idx + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
        >
          Open Supabase
          <ArrowSquareOut size={14} weight="bold" />
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 border border-line bg-paper px-5 text-sm font-semibold text-ink-soft transition hover:border-pine hover:text-ink"
        >
          View the public site
        </Link>
      </div>
    </main>
  );
}
