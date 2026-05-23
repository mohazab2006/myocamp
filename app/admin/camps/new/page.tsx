import Link from "next/link";
import { ArrowLeft, Tent } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { CampForm } from "@/components/admin/camp-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";

export const dynamic = "force-dynamic";

export default async function AdminCampsNewPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/camps"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to camps
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex items-center gap-3 text-pine">
          <Tent size={22} weight="duotone" />
          <span className="eyebrow text-brass">New camp</span>
        </div>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">Create a camp.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Fill in the basics. Add your JotForm IDs and you're done — submissions will start
          flowing into the registrations tab automatically.
        </p>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <CampForm />
      </div>
    </main>
  );
}
