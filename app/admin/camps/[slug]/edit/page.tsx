import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash, WarningCircle } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { CampForm } from "@/components/admin/camp-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { fetchCampBySlug } from "@/lib/admin/camps";
import { archiveCampAction, deleteCampAction } from "../../actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function AdminCampEditPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { slug } = await params;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const camp = await fetchCampBySlug(slug);
  if (!camp) notFound();

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href={`/admin/camps/${camp.slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to {camp.title}
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <span className="eyebrow text-brass">Edit camp</span>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">{camp.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Change any setting below. Swapping the JotForm IDs will update the public site
          immediately. Status changes also auto-flip the form shown on /camp.
        </p>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <CampForm camp={camp} />
      </div>

      <section className="mt-10 border border-ember/40 bg-ember/10 p-6 md:p-8">
        <div className="flex items-center gap-2 text-ember">
          <WarningCircle size={18} weight="duotone" />
          <p className="eyebrow">Danger zone</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-display text-lg tracking-tight text-ink">Archive camp</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Keeps all records (registrations, payments, waitlist) but removes it from
              public site and the active overview. Recommended for past camps.
            </p>
            <form action={archiveCampAction} className="mt-4">
              <input type="hidden" name="id" value={camp.id} />
              <input type="hidden" name="slug" value={camp.slug} />
              <AdminSubmitButton
                idleLabel="Archive camp"
                pendingLabel="Archiving…"
                variant="secondary"
              />
            </form>
          </div>
          <div>
            <h3 className="font-display text-lg tracking-tight text-ink">Delete forever</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Permanently removes the camp and cascades to its registrations, invoices,
              payments, and waitlist entries. Only works on Draft or Archived camps.
            </p>
            <form action={deleteCampAction} className="mt-4">
              <input type="hidden" name="id" value={camp.id} />
              <input type="hidden" name="slug" value={camp.slug} />
              <AdminSubmitButton
                idleLabel="Delete camp"
                pendingLabel="Deleting…"
                variant="danger"
                icon={<Trash size={14} weight="bold" />}
              />
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
