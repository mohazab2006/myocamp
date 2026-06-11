import { ArrowUpRight, EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { getSiteSettings } from "@/lib/content/org";

export async function HomeNewsletterStrip() {
  const settings = await getSiteSettings();

  return (
    <section className="border-t border-line bg-paper-deep/35">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-start gap-3 md:items-center">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-paper">
            <EnvelopeSimple size={18} weight="fill" />
          </span>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-brass">MYO Adventure List</div>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink md:text-base">
              Hike dates, camp announcements, and volunteer calls — one short email list.
            </p>
          </div>
        </div>
        <a
          href={settings.newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
        >
          Join the newsletter
          <ArrowUpRight
            size={14}
            weight="bold"
            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </section>
  );
}
