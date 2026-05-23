import Link from "next/link";
import { ArrowSquareOut, CheckCircle, Tent } from "@phosphor-icons/react/ssr";

import { AdminField, adminInputClass } from "@/components/admin/field";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getCampSettings } from "@/lib/content/camp";
import { isSupabaseConfigured } from "@/lib/supabase/content";
import type { CampSettings } from "@/lib/types";

import { saveCampStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const registrationStatusOptions: {
  value: CampSettings["registrationStatus"];
  label: string;
  hint: string;
}[] = [
  {
    value: "opening-soon",
    label: "Opening soon",
    hint: "Not open yet — page shows the opening date and newsletter prompt."
  },
  {
    value: "open",
    label: "Open now",
    hint: "Registration is live — JotForm is accepting submissions."
  },
  { value: "full", label: "Full", hint: "All spots taken — point families to the waitlist." },
  { value: "closed", label: "Closed", hint: "Registration is finished for this cycle." }
];

export default async function AdminCampPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const camp = await getCampSettings();
  const supabaseContentConnected = isSupabaseConfigured();
  const currentOption = registrationStatusOptions.find(
    (option) => option.value === camp.registrationStatus
  );

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Camp</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">
              Camp registration status.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Flips the badge and copy across{" "}
              <Link
                href="/camp/register"
                target="_blank"
                className="text-pine underline underline-offset-4 hover:text-forest"
              >
                /camp/register
              </Link>{" "}
              and homepage CTAs. The JotForm itself is still controlled inside JotForm — this only
              changes how the site frames it.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
              supabaseContentConnected
                ? "border-pine/30 bg-sky/55 text-forest"
                : "border-ember/40 bg-ember/10 text-ink"
            }`}
          >
            <Tent size={14} weight="duotone" />
            {supabaseContentConnected
              ? `Currently: ${currentOption?.label ?? camp.registrationStatus}`
              : "Supabase not connected"}
          </div>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <form
        action={saveCampStatusAction}
        className="mt-8 grid gap-6 border border-line bg-paper-deep/35 p-6 md:p-8"
      >
        <AdminField
          label="Registration status"
          hint={currentOption?.hint ?? "Pick what visitors see on the camp pages."}
          required
        >
          <select
            className={adminInputClass}
            name="registrationStatus"
            defaultValue={camp.registrationStatus}
            required
            disabled={!supabaseContentConnected}
          >
            {registrationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AdminField>

        <div className="grid gap-3 border border-line bg-paper p-4 text-xs leading-relaxed text-ink-soft md:grid-cols-4">
          {registrationStatusOptions.map((option) => (
            <div
              key={option.value}
              className={`border p-3 ${
                option.value === camp.registrationStatus
                  ? "border-forest bg-paper-deep/40 text-ink"
                  : "border-line bg-paper-deep/15"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                {option.label}
              </p>
              <p className="mt-2 leading-relaxed">{option.hint}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-xs leading-relaxed text-ink-soft">
            {supabaseContentConnected
              ? "Saving updates content_camp_settings in Supabase and revalidates the camp pages."
              : "Connect Supabase (Setup tab) before saving — falls back to lib/content/camp.ts until configured."}
          </p>
          <AdminSubmitButton
            idleLabel="Save status"
            pendingLabel="Saving…"
            icon={<CheckCircle size={16} weight="bold" />}
            disabled={!supabaseContentConnected}
          />
        </div>
      </form>

      <div className="mt-6 flex justify-end">
        <Link
          href="/camp/register"
          target="_blank"
          className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
        >
          Preview /camp/register
          <ArrowSquareOut size={12} weight="bold" />
        </Link>
      </div>
    </main>
  );
}
