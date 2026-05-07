import Link from "next/link";
import { ArrowUpRight, CompassRose, Flame, HandHeart, MapPin, Mountains, Tent } from "@phosphor-icons/react/dist/ssr";
import { getEvents } from "@/lib/content/events";
import { getPrograms } from "@/lib/content/programs";
import { orgMission } from "@/lib/content/org";
import { isUpcoming } from "@/lib/date";
import { EventCard } from "@/components/main/EventCard";
import { ButtonLink } from "@/components/main/Button";

export default async function HomePage() {
  const [allEvents, programs] = await Promise.all([getEvents(), getPrograms()]);
  const upcoming = allEvents.filter((e) => isUpcoming(e)).sort(
    (a, b) => +new Date(a.startDate) - +new Date(b.startDate)
  );
  const teaserEvents = upcoming.slice(0, 3);
  const activePrograms = programs.filter((p) => p.active);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 pb-20 pt-14 md:gap-10 md:px-10 md:pb-32 md:pt-20">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-brass">Muslim Youth of Ottawa · since the 1980s</div>
            <h1 className="headline-display mt-5 text-[44px] md:text-[88px]">
              The woods, the mosque, and the<br className="hidden md:inline" />
              <span className="italic text-pine"> community in between.</span>
            </h1>
            <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-ink-soft">{orgMission}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/events">See what&apos;s coming up</ButtonLink>
              <ButtonLink href="/camp" variant="secondary" withArrow={false}>
                <Flame size={14} weight="fill" className="text-ember" />
                The Summer Camp
              </ButtonLink>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep md:translate-y-6">
              <img
                src="/Pictures/trails.jpg"
                alt="A pine trail at MYO Camp Smitty"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-5 text-paper">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/75">Camp Smitty · Eganville</div>
                <div className="text-base">Trails behind the boys&apos; cabins, August 2025.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="border-t border-line bg-paper-deep/60">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-4">
            <div className="eyebrow text-brass">What MYO does</div>
            <h2 className="headline-display mt-4 text-4xl md:text-5xl">
              A year-round community, not just a summer week.
            </h2>
          </div>
          <div className="col-span-12 grid gap-6 md:col-span-8 md:grid-cols-2">
            {[
              { icon: <Mountains size={28} weight="duotone" />, title: "Hikes & outings", body: "Monthly walks in Gatineau, Pinhey, and the Carp ridge — slow pace, halal lunch, no drop-offs." },
              { icon: <CompassRose size={28} weight="duotone" />, title: "Halaqas & study", body: "Weekly youth circles, Quran recitation nights, and parents' study tracks throughout the year." },
              { icon: <HandHeart size={28} weight="duotone" />, title: "Service & care", body: "Food-bank shifts, neighbour days, fundraising dinners that subsidise camp spots for families." },
              { icon: <Tent size={28} weight="duotone" />, title: "The summer camp", body: "Flagship week at Camp Smitty: cabins, canoes, fire-circles, leadership, and a lot of laughing." }
            ].map((c) => (
              <div key={c.title} className="border-t border-line pt-6">
                <div className="text-pine">{c.icon}</div>
                <h3 className="font-display mt-3 text-xl tracking-tight">{c.title}</h3>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-soft">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow text-brass">Upcoming</div>
              <h2 className="headline-display mt-3 text-4xl md:text-5xl">
                Three things on the calendar.
              </h2>
            </div>
            <Link href="/events" className="inline-flex items-center gap-2 text-sm text-pine hover:text-forest">
              All events <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            {teaserEvents.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* CAMP TEASER — separate visual treatment, points into /camp */}
      <section className="relative overflow-hidden bg-forest text-paper">
        <div className="absolute inset-0 opacity-25">
          <img src="/Pictures/canoes2.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/20" />
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-24 md:gap-10 md:px-10 md:py-36">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-paper/65">Our biggest week of the year</div>
            <h2 className="font-camp mt-4 text-5xl leading-[0.92] tracking-tight md:text-7xl">
              MYO Summer Camp
            </h2>
            <p className="font-script mt-2 text-3xl text-paper/85 md:text-4xl">a different kind of week</p>
            <p className="mt-7 max-w-[60ch] text-lg leading-relaxed text-paper/82">
              Seven nights at Camp Smitty in Eganville. Cabins, canoes, fire-circles, the call to prayer at the
              dock, knot-tying contests, and a whole forest to disappear into. Ages 9 to 16, plus LIT for
              17-to-19s.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/camp"
                className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-paper transition hover:translate-y-[-1px]"
              >
                <Flame size={14} weight="fill" />
                Visit the camp site
              </Link>
              <Link
                href="/camp/register"
                className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-5 py-2.5 text-sm text-paper hover:bg-paper/5"
              >
                Registration details
                <ArrowUpRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { src: "/Pictures/bFirePit.jpg", label: "Fire-pit, last night" },
                { src: "/Pictures/canoes.jpg", label: "Morning canoe rotation" },
                { src: "/Pictures/trails.jpg", label: "Pine trails out back" },
                { src: "/Pictures/assembly.jpg", label: "Closing assembly" }
              ].map((p, i) => (
                <div
                  key={p.src}
                  className={`overflow-hidden bg-paper/10 ${i % 2 ? "translate-y-6" : ""}`}
                >
                  <div className="aspect-[4/5]">
                    <img src={p.src} alt={p.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-paper/70">
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS STRIP */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow text-brass">Year-round</div>
              <h2 className="headline-display mt-3 text-4xl md:text-5xl">
                What we&apos;re running right now.
              </h2>
            </div>
            <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-pine hover:text-forest">
              All programs <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>

          <ul className="mt-10">
            {activePrograms.slice(0, 4).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="grid grid-cols-12 gap-4 border-t border-line py-8 transition hover:bg-paper-deep/40"
                >
                  <div className="col-span-12 text-xs uppercase tracking-[0.16em] text-brass md:col-span-3">
                    {p.cadence}
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <div className="font-display text-2xl tracking-tight">{p.title}</div>
                    <p className="mt-1 max-w-[58ch] text-sm text-ink-soft">{p.blurb}</p>
                  </div>
                  <div className="col-span-12 flex items-center justify-end gap-2 md:col-span-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-pine">Open</span>
                    <ArrowUpRight size={16} className="text-ink-soft" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SUPPORT BAND */}
      <section className="border-t border-line bg-paper-deep/50">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-brass">How to help</div>
            <h2 className="headline-display mt-3 text-4xl md:text-5xl">
              We&apos;re volunteer-led. <em className="text-pine">Subsidies are how more youth make it.</em>
            </h2>
            <p className="mt-6 max-w-[58ch] text-ink-soft">
              Every spring fundraiser covers about seventeen camp spots. Donations through the year buy gear,
              cover counsellor training, and bring families who can&apos;t afford the week into it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/support">Donate</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Become a volunteer
              </ButtonLink>
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-5">
            <div className="aspect-square overflow-hidden">
              <img src="/Pictures/coffeeStation.jpg" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-square overflow-hidden">
              <img src="/Pictures/messHall.jpg" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="col-span-2 aspect-[2/1] overflow-hidden">
              <img src="/Pictures/assembly.jpg" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-6 py-16 md:px-10">
          <div>
            <div className="eyebrow text-brass">Find us</div>
            <h3 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
              Got a question? We answer email.
            </h3>
          </div>
          <div className="flex items-center gap-2 text-ink-soft">
            <MapPin size={18} weight="duotone" />
            <span>Ottawa, Ontario</span>
            <span className="px-2">·</span>
            <a href="mailto:myoadmin@gmail.com" className="text-pine hover:text-forest">
              myoadmin@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
