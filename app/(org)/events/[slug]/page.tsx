import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarBlank, MapPin, Tag } from "@phosphor-icons/react/ssr";
import { getEvent, getEvents } from "@/lib/content/events";
import { fetchPublicCampBySlug } from "@/lib/content/camps-public";
import { formatRange, isUpcoming } from "@/lib/date";
import { ButtonAnchor, ButtonLink } from "@/components/main/Button";
import { EventCampPanel } from "@/components/main/EventCampPanel";

const isInternalHref = (href: string) => href.startsWith("/");

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.blurb };
}

export default async function EventPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const linkedCamp = event.campSlug ? await fetchPublicCampBySlug(event.campSlug) : null;
  const upcoming = isUpcoming(event);
  const heroImage = event.heroImage ?? linkedCamp?.heroImage ?? null;

  return (
    <article>
      <div className="relative bg-forest text-paper">
        {heroImage && (
          <>
            <div className="absolute inset-0">
              <img src={heroImage} alt="" className="h-full w-full object-cover opacity-55" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/15" />
          </>
        )}
        <div className="relative mx-auto max-w-[1320px] px-6 pb-20 pt-12 md:px-10 md:pb-32 md:pt-20">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
            <ArrowLeft size={14} weight="bold" /> All events
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-paper/80">
            <span className="rounded-full bg-paper/15 px-3 py-1">{event.type}</span>
            {linkedCamp ? (
              <span className="rounded-full bg-ember/90 px-3 py-1">Camp session</span>
            ) : null}
            {upcoming ? (
              <span className="rounded-full bg-ember/90 px-3 py-1">Upcoming</span>
            ) : (
              <span className="rounded-full bg-paper/15 px-3 py-1">Past</span>
            )}
          </div>
          <h1 className="headline-display mt-5 text-5xl md:text-7xl">{event.title}</h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-paper/85">{event.blurb}</p>
        </div>
      </div>

      <section className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
        <div className="col-span-12 grid gap-8 md:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <CalendarBlank size={14} /> When
              </div>
              <div className="mt-2 text-base text-ink">{formatRange(event.startDate, event.endDate)}</div>
            </div>
            <div className="border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <MapPin size={14} /> Where
              </div>
              <div className="mt-2 text-base text-ink">{event.location}</div>
            </div>
            <div className="border-t border-line pt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <Tag size={14} /> Audience
              </div>
              <div className="mt-2 text-base text-ink capitalize">{event.audience.join(", ")}</div>
            </div>
          </div>

          <div className="prose prose-stone max-w-none">
            <p className="text-lg leading-relaxed text-ink">{event.blurb}</p>
            {event.body && <p className="text-ink-soft">{event.body}</p>}
            {!linkedCamp && event.type === "camp" && isInternalHref(event.registerUrl ?? "") && (
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/camp" variant="secondary">
                  Camp home
                </ButtonLink>
                <ButtonLink href="/camp/register" variant="secondary">
                  Registration
                </ButtonLink>
                <ButtonLink href="/camp/location" variant="secondary">
                  Location
                </ButtonLink>
                <ButtonLink href="/camp/rules" variant="secondary">
                  Rules
                </ButtonLink>
              </div>
            )}
          </div>
        </div>

        <aside className="col-span-12 space-y-6 md:col-span-4">
          {linkedCamp ? (
            <EventCampPanel camp={linkedCamp} upcoming={upcoming} />
          ) : (
            <div className="border border-line bg-paper-deep/40 p-6">
              <div className="text-xs uppercase tracking-[0.16em] text-brass">Sign up</div>
              <div className="font-display mt-2 text-2xl tracking-tight">
                {upcoming ? "Spot still available" : "This event has wrapped"}
              </div>
              {event.cost && (
                <div className="mt-3 text-sm text-ink-soft">Cost: {event.cost}</div>
              )}
              {upcoming && event.registerUrl ? (
                <div className="mt-5">
                  {isInternalHref(event.registerUrl) ? (
                    <ButtonLink href={event.registerUrl}>View MYO Summer Camp</ButtonLink>
                  ) : (
                    <ButtonAnchor href={event.registerUrl} target="_blank" rel="noopener">
                      Open registration
                    </ButtonAnchor>
                  )}
                </div>
              ) : !upcoming ? (
                <p className="mt-4 text-sm text-ink-soft">
                  Want to join the next one like this?{" "}
                  <Link href="/events" className="text-pine underline">
                    See upcoming events
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">
                  Email{" "}
                  <a href="mailto:myoadmin@gmail.com" className="text-pine underline">
                    myoadmin@gmail.com
                  </a>{" "}
                  to be added.
                </p>
              )}
            </div>
          )}
        </aside>
      </section>
    </article>
  );
}
