import Link from "next/link";
import { ArrowLeft, Lock } from "@phosphor-icons/react/dist/ssr";

export default function AdminStub() {
  return (
    <section className="mx-auto flex min-h-[100dvh] max-w-[720px] flex-col justify-center px-6 py-20 md:px-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} weight="bold" /> Back to MYO
      </Link>

      <div className="mt-12 rounded-2xl border border-line bg-paper-deep/50 p-10">
        <div className="flex items-center gap-3 text-ember">
          <Lock size={28} weight="duotone" />
          <span className="text-xs uppercase tracking-[0.18em]">Admin · phase 2</span>
        </div>
        <h1 className="headline-display mt-5 text-4xl md:text-5xl">
          Owner dashboard isn&apos;t live yet.
        </h1>
        <p className="mt-5 text-ink-soft">
          We&apos;re building this in phase 2 with Sanity Studio so the owner can edit events, programs,
          payment links, registration status, and hero images directly — no redeploys, no developer.
        </p>
        <ul className="mt-6 space-y-1 text-sm text-ink-soft">
          <li>· Event &amp; program CRUD with auto-archive on date passing.</li>
          <li>· Camp settings: registration window, JotForm URL, fees, dates.</li>
          <li>· Site settings: donate URL, volunteer URL, contact email.</li>
          <li>· Image library tied to public uploads (Sanity asset CDN).</li>
        </ul>
        <p className="mt-8 text-sm text-ink-soft">
          Until then, edits go through code in <code className="rounded bg-ink/10 px-1 py-0.5 text-xs">lib/content/*.ts</code>.
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        See <code className="rounded bg-ink/10 px-1 py-0.5">docs/ADMIN.md</code> for the phase-2 plan.
      </p>
    </section>
  );
}
