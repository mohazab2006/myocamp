import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  PauseCircle,
  PencilSimple
} from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import {
  resolveAdminFlashState,
  type AdminSearchParams
} from "@/lib/admin/page-state";
import {
  fetchEmailTemplate,
  TEMPLATE_PLACEHOLDERS,
  type EmailTemplateSlug
} from "@/lib/admin/email-templates";
import { extractPlaceholders, renderTemplate } from "@/lib/email/templates";
import { saveEmailTemplateAction } from "../actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: AdminSearchParams;
}

const TEMPLATE_SLUGS: EmailTemplateSlug[] = [
  "registration_received",
  "invoice_reminder",
  "waitlist_promoted",
  "payment_confirmation"
];

const SAMPLE_VALUES: Record<EmailTemplateSlug, Record<string, string>> = {
  registration_received: {
    parent_name: "Sarah Patel",
    camper_name: "Omar Patel",
    camp_title: "Main Camp 2026",
    camp_dates: "July 6 – July 12, 2026",
    ref: "MYO-2026-A7X2",
    amount: "$325.00",
    payment_url: "https://myo.camp/camp/pay/MYO-2026-A7X2"
  },
  invoice_reminder: {
    parent_name: "Sarah Patel",
    camper_name: "Omar Patel",
    camp_title: "Main Camp 2026",
    camp_dates: "July 6 – July 12, 2026",
    ref: "MYO-2026-A7X2",
    amount: "$325.00",
    payment_url: "https://myo.camp/camp/pay/MYO-2026-A7X2",
    days_until_camp: "3"
  },
  waitlist_promoted: {
    parent_name: "Sarah Patel",
    camper_name: "Omar Patel",
    camp_title: "Main Camp 2026",
    camp_dates: "July 6 – July 12, 2026",
    claim_url: "https://myo.camp/camp/main-2026/claim/abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234",
    claim_window: "48 hours"
  },
  payment_confirmation: {
    parent_name: "Sarah Patel",
    camper_name: "Omar Patel",
    camp_title: "Main Camp 2026",
    camp_dates: "July 6 – July 12, 2026",
    ref: "MYO-2026-A7X2",
    amount_paid: "$325.00",
    payment_method: "Interac e-Transfer"
  }
};

export default async function EditEmailTemplatePage({ params, searchParams }: PageProps) {
  await requireAuthorizedAdmin();
  const { slug } = await params;
  const flash = await resolveAdminFlashState(searchParams);

  if (!TEMPLATE_SLUGS.includes(slug as EmailTemplateSlug)) {
    notFound();
  }
  const typedSlug = slug as EmailTemplateSlug;

  const template = await fetchEmailTemplate(typedSlug);
  if (!template) notFound();

  const sample = SAMPLE_VALUES[typedSlug];
  const preview = renderTemplate({
    subjectTemplate: template.subject,
    bodyTemplate: template.bodyMarkdown,
    values: sample
  });

  const subjectVars = extractPlaceholders(template.subject);
  const bodyVars = extractPlaceholders(template.bodyMarkdown);
  const declaredVars = new Set(TEMPLATE_PLACEHOLDERS[typedSlug]);
  const unknownVars = [...new Set([...subjectVars, ...bodyVars])].filter(
    (v) => !declaredVars.has(v)
  );

  return (
    <div className="space-y-6">
      <AdminFlashBanner message={flash.message} type={flash.type} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/emails"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft weight="bold" className="size-3.5" />
          All templates
        </Link>
        <StatusPill enabled={template.enabled} />
      </div>

      <header className="space-y-3 border border-line bg-paper px-6 py-7 sm:px-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          {template.slug}
        </p>
        <h1 className="font-display text-[26px] leading-tight text-ink sm:text-[32px]">
          {template.label}
        </h1>
        {template.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            {template.description}
          </p>
        )}
        <p className="text-[11px] text-ink-muted">
          Available placeholders for this template:{" "}
          {TEMPLATE_PLACEHOLDERS[typedSlug].map((p, i, arr) => (
            <span key={p}>
              <code className="border border-line bg-paper-deep px-1 py-0.5 text-[10px]">
                &#123;&#123;{p}&#125;&#125;
              </code>
              {i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">
        <EditorPanel
          template={template}
          unknownVars={unknownVars}
        />
        <PreviewPanel
          subject={preview.subject}
          html={preview.html}
        />
      </div>
    </div>
  );
}

function StatusPill({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1 border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-success">
        <CheckCircle weight="fill" className="size-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-ink-muted/40 bg-paper-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
      <PauseCircle weight="fill" className="size-3" /> Paused
    </span>
  );
}

function EditorPanel({
  template,
  unknownVars
}: {
  template: { slug: string; subject: string; bodyMarkdown: string; enabled: boolean };
  unknownVars: string[];
}) {
  return (
    <form action={saveEmailTemplateAction} className="space-y-5 border border-line bg-paper px-6 py-6">
      <input type="hidden" name="slug" value={template.slug} />

      <div className="flex items-center gap-2">
        <PencilSimple weight="bold" className="size-4 text-ink" />
        <h2 className="font-display text-lg text-ink">Edit template</h2>
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Subject line
        </span>
        <input
          name="subject"
          defaultValue={template.subject}
          required
          className="w-full border border-line bg-paper-deep px-3 py-2.5 font-mono text-sm text-ink outline-none focus:border-ink"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Body (Markdown)
        </span>
        <textarea
          name="bodyMarkdown"
          defaultValue={template.bodyMarkdown}
          required
          rows={18}
          spellCheck
          className="w-full resize-y border border-line bg-paper-deep px-3 py-2.5 font-mono text-sm leading-relaxed text-ink outline-none focus:border-ink"
        />
        <p className="text-[11px] text-ink-muted">
          Markdown supported: <strong>**bold**</strong>, <em>*italic*</em>, [link text](https://…), blank lines for new paragraphs, lines starting with <code className="border border-line bg-paper-deep px-1 py-0.5 text-[10px]">-</code> for bullet lists.
        </p>
      </label>

      {unknownVars.length > 0 && (
        <div className="border border-warning/40 bg-warning/10 px-3 py-2.5 text-[12px] text-ink">
          <p className="font-semibold">Unknown placeholders</p>
          <p className="mt-0.5 text-ink-soft">
            These tokens aren't passed by the system for this template and will render as empty:{" "}
            {unknownVars.map((v, i) => (
              <span key={v}>
                <code className="border border-line bg-paper px-1 py-0.5 text-[10px]">
                  &#123;&#123;{v}&#125;&#125;
                </code>
                {i < unknownVars.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      <label className="flex items-center gap-2 border-t border-line pt-4 text-sm text-ink">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={template.enabled}
          className="size-4 accent-forest"
        />
        <span>
          <strong>Template is enabled.</strong> Uncheck to silently skip this email type everywhere.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <AdminSubmitButton idleLabel="Save changes" pendingLabel="Saving…" />
        <Link
          href="/admin/emails"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function PreviewPanel({ subject, html }: { subject: string; html: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border border-line bg-paper px-5 py-3">
        <Eye weight="bold" className="size-4 text-ink" />
        <h2 className="font-display text-base text-ink">Live preview</h2>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Sample data
        </span>
      </div>
      <div className="border border-line bg-paper">
        <div className="border-b border-line bg-paper-deep px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Subject
          </p>
          <p className="mt-1 font-mono text-sm text-ink">{subject || "(empty)"}</p>
        </div>
        <iframe
          title="Email preview"
          srcDoc={html}
          className="h-[640px] w-full border-0 bg-paper-deep"
          sandbox=""
        />
      </div>
    </div>
  );
}
