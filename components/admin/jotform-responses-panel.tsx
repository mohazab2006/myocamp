import Link from "next/link";
import { FileText } from "@phosphor-icons/react/ssr";

import {
  formatJotformResponses,
  jotformSubmissionMeta,
  type JotformResponseField
} from "@/lib/admin/jotform-display";

type JotformResponsesPanelProps = {
  rawPayload: Record<string, unknown>;
  /** Shown when no stored answers (manual entry, old import, etc.) */
  emptyHint?: string;
};

export function JotformResponsesPanel({ rawPayload, emptyHint }: JotformResponsesPanelProps) {
  const fields = formatJotformResponses(rawPayload);
  const meta = jotformSubmissionMeta(rawPayload);
  const isManual = rawPayload._manualEntry === true;

  return (
    <section className="border border-line bg-paper p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-brass flex items-center gap-2">
            <FileText size={14} weight="duotone" /> JotForm responses
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
            Full form submission
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Everything the parent entered on the registration form — medical info, authorizations,
            addresses, and the rest. The summary above stays unchanged; this is the complete record.
          </p>
        </div>
        {(meta.formId || meta.submissionId) && (
          <div className="text-right text-xs text-ink-soft">
            {meta.formId ? (
              <p>
                Form{" "}
                <Link
                  href={`https://www.jotform.com/build/${meta.formId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-pine underline underline-offset-4 hover:text-forest"
                >
                  {meta.formId}
                </Link>
              </p>
            ) : null}
            {meta.submissionId ? (
              <p className="mt-1">
                Submission{" "}
                <Link
                  href={`https://www.jotform.com/submissions/${meta.submissionId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-pine underline underline-offset-4 hover:text-forest"
                >
                  {meta.submissionId}
                </Link>
              </p>
            ) : null}
          </div>
        )}
      </div>

      {isManual ? (
        <p className="mt-6 border border-dashed border-line bg-paper-deep/25 px-4 py-3 text-sm text-ink-soft">
          This entry was added manually in admin — there is no JotForm submission on file.
        </p>
      ) : fields.length === 0 ? (
        <p className="mt-6 border border-dashed border-line bg-paper-deep/25 px-4 py-3 text-sm text-ink-soft">
          {emptyHint ??
            "No form answers stored yet. New submissions from JotForm will appear here automatically."}
        </p>
      ) : (
        <dl className="mt-6 divide-y divide-line/60 border border-line bg-paper-deep/20">
          {fields.map((field) => (
            <ResponseRow key={field.key} field={field} />
          ))}
        </dl>
      )}
    </section>
  );
}

function ResponseRow({ field }: { field: JotformResponseField }) {
  const isUrl = /^https?:\/\//i.test(field.value);

  return (
    <div className="grid gap-2 px-4 py-4 md:grid-cols-[minmax(180px,34%)_1fr] md:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {field.label}
      </dt>
      <dd className="min-w-0 text-sm text-ink">
        {isUrl ? (
          <a
            href={field.value}
            target="_blank"
            rel="noreferrer"
            className="break-all text-pine underline underline-offset-4 hover:text-forest"
          >
            {field.value}
          </a>
        ) : field.multiline ? (
          <p className="whitespace-pre-wrap leading-relaxed">{field.value}</p>
        ) : (
          <span className="break-words">{field.value}</span>
        )}
      </dd>
    </div>
  );
}
