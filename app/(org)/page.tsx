import Link from "next/link";
import { ArrowUpRight, Flame } from "@phosphor-icons/react/ssr";
import { getBlogPosts } from "@/lib/content/blog";
import { getHomeCampSnapshot, sortHomeUpcomingEvents } from "@/lib/content/home-camp";
import { formatPostDate } from "@/lib/date";
import { BlogCard } from "@/components/main/BlogCard";
import { EventCard } from "@/components/main/EventCard";
import { OrgHero } from "@/components/main/OrgHero";
import { RotatingGallery } from "@/components/main/RotatingGallery";
import { SectionHeader } from "@/components/main/SectionHeader";
import { AnnouncementBar } from "@/components/main/AnnouncementBar";
import { HomeCampDates } from "@/components/main/HomeCampDates";
import { HomeNewsletterStrip } from "@/components/main/HomeNewsletterStrip";
import { RevealOnScroll } from "@/components/main/RevealOnScroll";
import { Marquee } from "@/components/main/Marquee";
import {
  PaintedDivider,
  CompassIcon,
  FlameIcon,
  KnotIcon,
  BowIcon,
  TentIcon,
  CanoeIcon,
  SparkIcon
} from "@/components/camp/Illustrations";

const pillarDefs = [
  {
    title: "Camp",
    href: "/camp",
    image: "/Pictures/verycoolcampfire.jpg",
    note: "Two sessions this summer."
  },
  {
    title: "Events",
    href: "/events",
    image: "/Pictures/racersgroup.jpg",
    note: "Hikes, bonfires, service days."
  },
  {
    title: "Blog",
    href: "/blog",
    image: "/Pictures/LITgroup.JPG",
    note: "Hikes, trips, and field notes.",
    objectPosition: "34% center"
  }
];

export default async function HomePage() {
  const [homeCamp, blogPosts] = await Promise.all([getHomeCampSnapshot(), getBlogPosts()]);
  const { bigNews, campDates, registrationIsOpen, publishedCampSlugs, linkedCampsBySlug } =
    homeCamp;

  const upcoming = sortHomeUpcomingEvents(homeCamp.events, publishedCampSlugs);
  const teaserEvents = upcoming.slice(0, 3);
  const latestPosts = blogPosts.slice(0, 3);
  const latestPostDate = latestPosts[0] ? formatPostDate(latestPosts[0].publishedAt) : null;

  const pillars = pillarDefs.map((p) =>
    p.title === "Camp" && registrationIsOpen
      ? { ...p, note: "Registration is open — two sessions." }
      : p
  );

  const pillarIcons = [TentIcon, FlameIcon, SparkIcon] as const;

  return (
    <>
      <OrgHero />

      <AnnouncementBar
        label={bigNews.label ?? "Big News"}
        message={bigNews.message}
        highlight={bigNews.highlight}
        links={bigNews.links}
      />

      <HomeCampDates dates={campDates} registrationIsOpen={registrationIsOpen} />

      {/* THREE PILLARS — image-led with hover flourishes */}
      <section className="relative border-t border-line bg-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <RevealOnScroll className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6" y={48}>
            {pillars.map((p, idx) => {
              const Icon = pillarIcons[idx];
              return (
                <Link
                  key={p.title}
                  href={p.href}
                  className="group relative block overflow-hidden bg-ink transition duration-500 hover:rotate-[-0.4deg] hover:shadow-[0_18px_40px_-20px_oklch(22%_0.018_132/0.6)]"
                >
                  <div className="aspect-4/5 w-full">
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-95"
                      style={
                        "objectPosition" in p
                          ? { objectPosition: p.objectPosition }
                          : undefined
                      }
                    />
                  </div>

                  {/* Decorative corner icon — fades in on hover */}
                  <Icon
                    size={56}
                    aria-hidden
                    className="pointer-events-none absolute right-5 top-5 text-paper/0 transition duration-500 group-hover:text-paper/90 group-hover:rotate-6"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink via-ink/60 to-transparent p-6 text-paper">
                    <div className="font-display text-4xl tracking-tight md:text-5xl">{p.title}</div>
                    <div className="mt-1 flex items-center justify-between text-sm text-paper/80">
                      <span>{p.note}</span>
                      <ArrowUpRight
                        size={20}
                        weight="bold"
                        className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </RevealOnScroll>
        </div>
      </section>

      {/* ROTATING GALLERY — each tile cross-fades through a curated set. */}
      <RotatingGallery />

      {/* UPCOMING EVENTS — image-led cards, minimal copy */}
      <section className="relative border-t border-line bg-paper">
        {/* Floating decorations */}
        <CompassIcon
          size={64}
          aria-hidden
          className="pointer-events-none absolute left-[3%] top-12 hidden text-pine/30 lg:block"
          style={{ rotate: "-8deg" }}
        />
        <SparkIcon
          size={36}
          aria-hidden
          className="pointer-events-none absolute right-[6%] top-16 hidden text-brass/70 lg:block"
          style={{ rotate: "10deg" }}
        />

        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            eyebrow="Upcoming"
            title="Coming up next."
            description={
              registrationIsOpen
                ? "Camp sessions and community events — tap a camp date for details, then head to the camp site to register."
                : "Hikes, bonfires, service days — the next handful of things on the MYO calendar."
            }
            scribbleColor="ember"
            action={
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition hover:border-ink hover:bg-paper-deep"
              >
                All events
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            }
          />

          <RevealOnScroll
            className="mt-14 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-3"
            y={36}
            stagger={0.1}
          >
            {teaserEvents.map((e) => (
              <EventCard
                key={e.slug}
                event={e}
                linkedCamp={e.campSlug ? linkedCampsBySlug[e.campSlug] ?? null : null}
              />
            ))}
          </RevealOnScroll>
        </div>

        <PaintedDivider className="text-ember/55" />
      </section>

      {/* CAMP BAND — centered hero on forest, image strip below */}
      <section className="relative overflow-hidden bg-forest text-paper">
        <div className="absolute inset-0 opacity-30">
          <img src="/Pictures/canoes2.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-forest/85 via-forest/70 to-forest/95" />

        {/* Forest-toned marquee at the top edge */}
        <div className="relative">
          <Marquee
            tone="forest"
            items={[
              "Camp Smitty",
              "Cabins · Canoes · Campfires",
              "Two sessions · 2026 only",
              "Ages 9 – 19",
              "Boys & Girls",
              "Subsidies available"
            ]}
          />
        </div>

        {/* Floating camp illustrations */}
        <CanoeIcon
          size={92}
          aria-hidden
          className="pointer-events-none absolute left-[3%] top-[28%] hidden text-paper/25 md:block"
          style={{ rotate: "-12deg" }}
        />
        <FlameIcon
          size={80}
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-[24%] hidden text-ember/70 md:block"
          style={{ rotate: "10deg" }}
        />
        <KnotIcon
          size={62}
          aria-hidden
          className="pointer-events-none absolute bottom-[36%] left-[6%] hidden text-paper/20 lg:block"
          style={{ rotate: "8deg" }}
        />
        <BowIcon
          size={74}
          aria-hidden
          className="pointer-events-none absolute bottom-[34%] right-[6%] hidden text-paper/25 lg:block"
          style={{ rotate: "-22deg" }}
        />

        <div className="relative mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            tone="light"
            size="lg"
            scribbleColor="ember"
            eyebrow="Our biggest week of the year"
            title={<span className="font-camp">MYO Summer Camp</span>}
            description={
              registrationIsOpen
                ? "Camp Smitty, Eganville. Registration is open — cabins, canoes, fire-circles, prayer, friendship."
                : "Camp Smitty, Eganville. Cabins, canoes, fire-circles, prayer, friendship."
            }
            action={
              <>
                <Link
                  href="/camp"
                  className="group inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-paper shadow-[0_1px_0_oklch(22%_0.018_132)] transition hover:-translate-y-px"
                >
                  <Flame
                    size={14}
                    weight="fill"
                    className="transition group-hover:scale-110"
                  />
                  {registrationIsOpen ? "Camp site · register now" : "Visit the camp site"}
                </Link>
                <Link
                  href={registrationIsOpen ? "/camp/register" : "/events"}
                  className="group inline-flex items-center gap-2 rounded-full border border-paper/35 px-6 py-3 text-sm font-medium text-paper transition hover:bg-paper/5"
                >
                  {registrationIsOpen ? "Pick a session" : "See camp events"}
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </>
            }
          />

          <RevealOnScroll
            className="mt-16 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-4 md:gap-5"
            y={50}
            stagger={0.1}
          >
            {[
              "/Pictures/story1.png",
              "/Pictures/canoes.jpg",
              "/Pictures/story2.png",
              "/Pictures/story3.png"
            ].map((src, i) => (
              <div
                key={src}
                className={`group aspect-4/5 overflow-hidden transition duration-500 hover:scale-[1.02] ${
                  i % 2 ? "hover:-rotate-1" : "hover:rotate-1"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                />
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* BLOG — adventure write-ups and announcements */}
      <section className="relative border-t border-line bg-paper">
        <KnotIcon
          size={56}
          aria-hidden
          className="pointer-events-none absolute right-[3%] top-12 hidden text-brass/45 lg:block"
          style={{ rotate: "10deg" }}
        />
        <BowIcon
          size={64}
          aria-hidden
          className="pointer-events-none absolute left-[4%] top-16 hidden text-pine/35 lg:block"
          style={{ rotate: "-18deg" }}
        />

        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            eyebrow={latestPostDate ? `Latest · ${latestPostDate}` : "Adventure Blog"}
            title="From the trail and the field."
            description="Hike announcements, service days, and trip notes from MYO Monthly Adventures."
            scribbleColor="pine"
            action={
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition hover:border-ink hover:bg-paper-deep"
              >
                All posts
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            }
          />

          <RevealOnScroll
            className="mt-14 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-3"
            y={36}
            stagger={0.1}
          >
            {latestPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} featured={index === 0} />
            ))}
          </RevealOnScroll>
        </div>
      </section>

      <HomeNewsletterStrip />

      {/* SUPPORT — centered hero, image strip below */}
      <section className="relative overflow-hidden border-t border-line bg-paper-deep/50">
        {/* Floating illustrations */}
        <FlameIcon
          size={88}
          aria-hidden
          className="pointer-events-none absolute left-[3%] top-[18%] hidden text-ember/55 md:block lg:left-[5%]"
          style={{ rotate: "-12deg" }}
        />
        <SparkIcon
          size={48}
          aria-hidden
          className="pointer-events-none absolute right-[6%] top-[12%] hidden text-brass/70 md:block"
          style={{ rotate: "10deg" }}
        />
        <CompassIcon
          size={70}
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-[24%] hidden text-pine/40 lg:block"
          style={{ rotate: "16deg" }}
        />
        <BowIcon
          size={72}
          aria-hidden
          className="pointer-events-none absolute bottom-[14%] left-[5%] hidden text-pine/45 lg:block"
          style={{ rotate: "-22deg" }}
        />

        <div className="relative mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            size="lg"
            eyebrow="How to help"
            title={<span className="italic text-pine">Subsidise a kid.</span>}
            description="Volunteer-led, community-funded. Every donation goes to camp spots and program gear."
            scribbleColor="ember"
            action={
              <>
                <Link
                  href="/support"
                  className="group inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper shadow-[0_1px_0_oklch(22%_0.018_132)] transition hover:bg-pine"
                >
                  Donate
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-6 py-3 text-sm font-medium text-ink transition hover:border-ink hover:bg-paper"
                >
                  <Flame
                    size={14}
                    weight="fill"
                    className="text-ember transition group-hover:scale-110"
                  />
                  Volunteer
                </Link>
              </>
            }
          />

          <RevealOnScroll
            className="mt-16 grid grid-cols-1 gap-3 md:mt-20 md:grid-cols-3 md:gap-5"
            y={50}
            stagger={0.12}
          >
            {[
              "/Pictures/709223_orig.jpg",
              "/Pictures/9839735_orig.jpg",
              "/Pictures/2179023_orig.jpg"
            ].map((src, i) => (
              <div
                key={src}
                className={`group aspect-4/5 overflow-hidden bg-paper transition duration-500 hover:scale-[1.02] ${
                  i % 2 ? "hover:-rotate-1" : "hover:rotate-1"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                />
              </div>
            ))}
          </RevealOnScroll>
        </div>

        <PaintedDivider className="text-ember/55" />
      </section>
    </>
  );
}
