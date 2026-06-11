import Link from "next/link";
import { ArrowSquareOut, Megaphone } from "@phosphor-icons/react/ssr";

import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getCampSettings } from "@/lib/content/camp";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const settings = await getCampSettings();
  const override = settings.announcementOverride;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Settings</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">
              Announcement Banner
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Customize the highlighted banner at the top of the home page. Enable it to override
              the automatic camp-registration message with your own text and links — e.g. for
              surveys, newsletter sign-ups, or any announcements.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-11 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View home page
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <AnnouncementForm override={override} />
      </div>
    </main>
  );
}
