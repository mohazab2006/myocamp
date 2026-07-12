"use client";

import { useState, useTransition } from "react";
import { importJotformSubmissionsAction, type ImportResult } from "./actions";
import { adminInputClass } from "@/components/admin/field";
import { AdminSubmitButton } from "@/components/admin/submit-button";

export default function ImportJotformPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await importJotformSubmissionsAction(fd);
      setResult(res);
    });
  }

  return (
    <main className="mx-auto max-w-[700px] px-5 py-10 md:px-8 md:py-14">
      <h1 className="headline-display text-3xl">Import from JotForm</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Fetches all submissions for a camp&apos;s registration form and creates missing
        registrations + invoices. Safe to run multiple times — existing registrations are
        skipped automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 border border-line bg-paper p-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Camp slug
          </label>
          <input
            name="campSlug"
            required
            defaultValue="myo-main-camp-2026"
            className={adminInputClass}
            placeholder="myo-main-camp-2026"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            JotForm API key
          </label>
          <input
            name="apiKey"
            required
            type="password"
            className={adminInputClass}
            placeholder="Paste read-only API key"
          />
          <p className="text-xs text-ink-soft">
            Not stored — used only for this request.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="sendEmails"
            value="1"
            defaultChecked
            className="h-4 w-4 accent-pine"
          />
          Send registration confirmation email to each imported family
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 border border-pine bg-forest px-5 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine disabled:opacity-50"
        >
          {isPending ? "Importing…" : "Import submissions"}
        </button>
      </form>

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Found" value={result.total} />
            <Stat label="Imported" value={result.imported} tone="ok" />
            <Stat label="Skipped" value={result.skipped} />
            <Stat label="Emails sent" value={result.emailsSent} tone="ok" />
          </div>

          {result.errors.length > 0 ? (
            <div className="border border-ember/40 bg-ember/10 p-4 text-xs text-ember">
              <p className="font-semibold">Errors ({result.errors.length})</p>
              <ul className="mt-2 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.previews.length > 0 ? (
            <div className="border border-line bg-paper">
              <div className="border-b border-line bg-paper-deep/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Newly imported ({result.previews.length})
              </div>
              <ul className="divide-y divide-line/60">
                {result.previews.map((p, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                    <span className="font-semibold text-ink">{p.name ?? "Unknown"}</span>
                    <span className="text-ink-soft">{p.email ?? "no email"}</span>
                    <span className="ml-auto font-mono text-xs text-ink-soft">{p.ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.imported === 0 && result.errors.length === 0 ? (
            <p className="text-sm text-ink-soft">
              All submissions were already imported — nothing new to add.
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" }) {
  return (
    <div className="border border-line bg-paper-deep/35 p-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className={`mt-2 font-display text-3xl tracking-tight ${tone === "ok" ? "text-forest" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
