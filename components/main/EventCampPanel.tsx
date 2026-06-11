import Link from "next/link";
import { ArrowUpRight, Tent } from "@phosphor-icons/react/ssr";
import { formatRange } from "@/lib/date";
import type { PublicCamp } from "@/lib/content/camps-public";
import { ButtonLink } from "@/components/main/Button";

const statusLabels: Record<PublicCamp["status"], string> = {
  open: "Registration open",
  full: "Waitlist open",
  closed: "Registration closed",
  draft: "Opening soon",
  archived: "Archived"
};

type EventCampPanelProps = {
  camp: PublicCamp;
  upcoming: boolean;
};

export function EventCampPanel({ camp, upcoming }: EventCampPanelProps) {
  const canRegister =
    upcoming && (camp.registrationStatus === "open" || camp.registrationStatus === "full");
  const isWaitlist = camp.registrationStatus === "full";

  return (
    <div className="overflow-hidden border border-line bg-paper-deep/40">
      {camp.heroImage ? (
        <div className="aspect-16/10 overflow-hidden bg-paper-deep">
          <img src={camp.heroImage} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-16/10 items-center justify-center bg-forest/10 text-pine">
          <Tent size={48} weight="duotone" />
        </div>
      )}

      <div className="p-6">
        <div className="text-xs uppercase tracking-[0.16em] text-brass">MYO Summer Camp</div>
        <h3 className="font-display mt-2 text-2xl tracking-tight text-ink">{camp.title}</h3>
        <p className="mt-2 text-sm text-ink-soft">{formatRange(camp.startDate, camp.endDate)}</p>
        {camp.location ? (
          <p className="mt-1 text-sm text-ink-soft">{camp.location}</p>
        ) : null}
        <p className="mt-3 text-sm text-ink">
          ${camp.feePerCamper.toFixed(0)} per camper ·{" "}
          {isWaitlist ? "Waitlist open" : statusLabels[camp.status]}
        </p>

        {canRegister ? (
          <div className="mt-5 grid gap-2">
            <ButtonLink href="/camp">
              {isWaitlist ? "Visit camp site · waitlist" : "Visit camp site · register"}
            </ButtonLink>
            <Link
              href={camp.registerPath}
              className="inline-flex items-center gap-1 text-sm text-pine underline underline-offset-4 hover:text-ink"
            >
              Register form <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            Registration isn&apos;t open for this session right now.{" "}
            <Link href="/camp" className="text-pine underline">
              Visit the camp page
            </Link>{" "}
            for updates.
          </p>
        )}
      </div>
    </div>
  );
}

export type EventLinkedCampSummary = {
  slug: string;
  title: string;
  heroImage: string | null;
  registerPath: string;
};

export function FeaturedCampCards({ camps }: { camps: PublicCamp[] }) {
  if (camps.length === 0) return null;

  return (
    <section className="border-b border-line bg-paper-deep/30">
      <div className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.18em] text-brass">Summer camp</div>
          <h2 className="font-display mt-2 text-3xl tracking-tight text-ink md:text-4xl">
            Register for camp.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Featured camp sessions — pick the one you&apos;re registering for and complete the form online.
          </p>
        </div>

        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {camps.map((camp) => (
            <li key={camp.id}>
              <Link
                href={camp.registerPath}
                className="group grid overflow-hidden border border-line bg-paper transition hover:border-pine md:grid-cols-[140px_1fr]"
              >
                <div className="aspect-4/3 overflow-hidden bg-paper-deep md:aspect-auto md:h-full">
                  {camp.heroImage ? (
                    <img
                      src={camp.heroImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center text-pine">
                      <Tent size={36} weight="duotone" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-brass">Featured session</div>
                  <h3 className="font-display mt-1 text-xl tracking-tight text-ink group-hover:text-pine">
                    {camp.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft">
                    {formatRange(camp.startDate, camp.endDate)}
                  </p>
                  <p className="mt-2 text-sm text-ink">
                    ${camp.feePerCamper.toFixed(0)} ·{" "}
                    {camp.registrationStatus === "open"
                      ? "Open"
                      : camp.registrationStatus === "full"
                        ? "Waitlist"
                        : "See details"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
