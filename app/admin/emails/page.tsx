import Link from "next/link";
import {
  ArrowSquareOut,
  CheckCircle,
  EnvelopeSimple,
  PaperPlaneTilt,
  PauseCircle,
  PencilSimple,
  Warning
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import {
  resolveAdminFlashState,
  type AdminSearchParams
} from "@/lib/admin/page-state";
import { fetchEmailTemplates } from "@/lib/admin/email-templates";
import { isResendConfigured } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: AdminSearchParams;
}

export default async function AdminEmailsPage({ searchParams }: PageProps) {
  await requireAuthorizedAdmin();
  const flash = await resolveAdminFlashState(searchParams);
  const templates = await fetchEmailTemplates();
  const resendReady = isResendConfigured();

  return (
    <div className="space-y-8">
      <AdminFlashBanner message={flash.message} type={flash.type} />

      <header className="space-y-3 border border-line bg-paper px-6 py-7 sm:px-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Email templates
        </p>
        <h1 className="font-display text-[30px] leading-tight text-ink sm:text-[36px]">
          Edit every email parents receive
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Every automated email comes from one of these templates. Change a subject line, tweak the wording, pause a template — nothing is hardcoded. Drafts save instantly, no deploy needed.
        </p>
      </header>

      <ResendStatusCard ready={resendReady} />

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/admin/emails/${t.slug}`}
                className="group flex h-full flex-col gap-4 border border-line bg-paper px-6 py-6 transition hover:border-ink hover:bg-paper-deep"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                      {t.slug}
                    </p>
                    <h2 className="mt-1 font-display text-xl text-ink">
                      {t.label}
                    </h2>
                  </div>
                  <TemplateStatusPill enabled={t.enabled} />
                </div>

                {t.description && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {t.description}
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  <div className="border-t border-line pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                      Current subject
                    </p>
                    <p className="mt-1 text-sm text-ink line-clamp-2">{t.subject}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-muted">
                    <span>Updated {formatRelative(t.updatedAt)}</span>
                    <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-ink group-hover:underline">
                      <PencilSimple weight="bold" className="size-3.5" />
                      Edit
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <PlaceholderReference />
    </div>
  );
}

function TemplateStatusPill({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1 border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-success">
        <CheckCircle weight="fill" className="size-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-ink-muted/40 bg-paper-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
      <PauseCircle weight="fill" className="size-3" /> Paused
    </span>
  );
}

function ResendStatusCard({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <div className="flex items-start gap-3 border border-success/30 bg-success/5 px-5 py-4 text-sm text-ink">
        <PaperPlaneTilt weight="fill" className="mt-0.5 size-4 text-success" />
        <div>
          <p className="font-semibold text-ink">Resend is connected.</p>
          <p className="mt-0.5 text-ink-soft">
            Outgoing email goes through <code className="border border-line bg-paper-deep px-1 py-0.5 text-[11px]">{process.env.EMAIL_FROM_ADDRESS}</code>. Replies route to the same address unless <code className="border border-line bg-paper-deep px-1 py-0.5 text-[11px]">EMAIL_REPLY_TO</code> is set.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 border border-warning/40 bg-warning/10 px-5 py-4 text-sm text-ink">
      <Warning weight="fill" className="mt-0.5 size-4 text-warning" />
      <div>
        <p className="font-semibold text-ink">Resend is not configured.</p>
        <p className="mt-0.5 text-ink-soft">
          Set <code className="border border-line bg-paper-deep px-1 py-0.5 text-[11px]">RESEND_API_KEY</code> and <code className="border border-line bg-paper-deep px-1 py-0.5 text-[11px]">EMAIL_FROM_ADDRESS</code> in your environment. Until then, every send will be logged as <em>failed</em> in the reminder log and no email will leave the system.
        </p>
        <Link
          href="/admin/setup"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
        >
          Go to setup <ArrowSquareOut weight="bold" className="size-3" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-line bg-paper px-6 py-12 text-center">
      <EnvelopeSimple weight="duotone" className="mx-auto size-10 text-ink-muted" />
      <p className="mt-3 text-sm text-ink-soft">
        No templates yet. Run migration <code className="border border-line bg-paper-deep px-1 py-0.5 text-xs">0004_email_templates.sql</code> to seed the defaults.
      </p>
    </div>
  );
}

function PlaceholderReference() {
  const groups = [
    {
      title: "Parent + camper",
      items: [
        { key: "parent_name", desc: "Parent's name from the registration" },
        { key: "camper_name", desc: "First camper's name (or '2 campers' if multiple)" }
      ]
    },
    {
      title: "Camp",
      items: [
        { key: "camp_title", desc: 'e.g. "Main Camp 2026"' },
        { key: "camp_dates", desc: 'e.g. "July 6 – July 12, 2026"' }
      ]
    },
    {
      title: "Invoice + payment",
      items: [
        { key: "ref", desc: 'Reference code, e.g. "MYO-2026-A7X2"' },
        { key: "amount", desc: "Outstanding balance, formatted as $325.00" },
        { key: "amount_paid", desc: "Most recent payment amount" },
        { key: "payment_method", desc: 'e.g. "PayPal", "Interac e-Transfer"' },
        { key: "payment_url", desc: "Direct link to /camp/pay/{ref}" },
        { key: "etransfer_memo", desc: 'Reference + first name, e.g. "MYO-2026-A7X2 Omar"' },
        { key: "contact_email", desc: "Support / reply-to address for payment questions" }
      ]
    },
    {
      title: "Waitlist",
      items: [
        { key: "claim_url", desc: "Direct link to /camp/{slug}/claim/{token}" },
        { key: "claim_window", desc: 'e.g. "48 hours"' }
      ]
    }
  ];
  return (
    <section className="border border-line bg-paper-deep px-6 py-7 sm:px-9">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Placeholder reference
        </p>
        <h2 className="font-display text-xl text-ink">
          Use these tokens anywhere in subject + body
        </h2>
        <p className="text-sm text-ink-soft">
          Wrap them in double curly braces — <code className="border border-line bg-paper px-1 py-0.5 text-xs">&#123;&#123;parent_name&#125;&#125;</code>. Missing values render as empty.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title} className="border border-line bg-paper p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {g.title}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {g.items.map((i) => (
                <li key={i.key} className="flex flex-col gap-0.5">
                  <code className="self-start border border-line bg-paper-deep px-1.5 py-0.5 text-[11px] text-ink">
                    &#123;&#123;{i.key}&#125;&#125;
                  </code>
                  <span className="text-xs text-ink-soft">{i.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hr ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} d ago`;
  return date.toLocaleDateString();
}
