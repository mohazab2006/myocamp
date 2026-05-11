import { ArrowUpRight, EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { getSiteSettings } from "@/lib/content/org";

export async function NewsletterCallout() {
  const settings = await getSiteSettings();

  return (
    <section className="border-t border-line bg-paper-deep/50">
      <div className="mx-auto flex max-w-[1320px] flex-col items-start gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-start gap-3 md:items-center">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-paper">
            <EnvelopeSimple size={20} weight="fill" />
          </span>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-brass">MYO Adventure List</div>
            <p className="mt-1 max-w-2xl text-base text-ink md:text-lg">
              Get hike dates, camp announcements, and volunteer calls in one short email list.
            </p>
          </div>
        </div>
        <a
          href={settings.newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-pine"
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
