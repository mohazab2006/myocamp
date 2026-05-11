import Link from "next/link";
import { CampHero } from "@/components/camp/CampHero";
import {
  CampIcon,
  PaintedDivider,
  TopoDivider
} from "@/components/camp/Illustrations";
import {
  campActivities,
  campSpaces,
  campWeekRhythm,
  getCampSettings
} from "@/lib/content/camp";
import { formatRange } from "@/lib/date";

export default async function CampHome() {
  const camp = await getCampSettings();
  const mainRange = formatRange(camp.campStart, camp.campEnd);
  const litRange =
    camp.litStart && camp.litEnd ? formatRange(camp.litStart, camp.litEnd) : undefined;

  return (
    <>
      <CampHero mainRange={mainRange} litRange={litRange} />

      {/* WHY CAMP */}
      <section className="border-y-2 border-camp-bark/15 bg-camp-paper-soft">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-5">
            <div className="font-script text-3xl text-camp-flame">field journal entry</div>
            <h2 className="font-camp mt-3 text-5xl leading-[0.92] text-camp-bark md:text-6xl">
              <span className="scribble-underline">A different rhythm.</span>
            </h2>
          </div>
          <div className="col-span-12 space-y-5 text-lg leading-relaxed text-camp-ink/85 md:col-span-7">
            <p>
              Most kids spend the summer indoors. Phones, screens, AC. Camp is the opposite — four nights in
              cabins, three meals around long wooden tables, a forest behind every door, and a lake that
              wakes up before everyone else.
            </p>
            <p>
              Quran in the morning. Prayer at the dock. Knot drills in the rec hall. Canoes after lunch. Fire
              circle at dusk. And the kind of friendships that turn into the next ten years of group chats.
            </p>
            <p>
              We&apos;re volunteer-led, which means it&apos;s also the kind of camp where the people running it
              actually know your kid&apos;s name by Friday.
            </p>
          </div>
        </div>
      </section>

      {/* 2026 SESSIONS */}
      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">summer 2026</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Two focused<br />four-day sessions.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                Instead of one full week, we&apos;re running two shorter sessions at Camp Smitty — a dedicated
                LIT track, then the main camp. Staff arrive {camp.staffArrival.toLowerCase()} before each
                session.
              </p>
            </div>
            <div className="col-span-12 grid gap-5 md:col-span-8 md:grid-cols-2">
              {[
                {
                  title: "LIT leadership track",
                  dates: litRange ?? "July 23–26, 2026",
                  body: "Ages 17–19. Lighter logistics, more responsibility — meals, activity planning, and waking yourselves up. Some LITs may graduate into counsellor roles for main camp."
                },
                {
                  title: "Main camp · core program",
                  dates: mainRange,
                  body: "Ages 9–16. The full MYO camp experience — cabins, skills stations, prayer, and fire circles — in a focused four-day session."
                }
              ].map((session, i) => (
                <article
                  key={session.title}
                  className="border-2 border-camp-bark/30 bg-camp-paper-soft p-6"
                  style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
                >
                  <div className="font-script text-xl text-camp-flame">{session.dates}</div>
                  <h3 className="font-camp mt-2 text-3xl text-camp-bark">{session.title}</h3>
                  <p className="mt-3 leading-relaxed text-camp-ink/80">{session.body}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="mt-10 max-w-[70ch] text-camp-ink/75">
            We may also run meetups, hikes, or a dedicated archery weekend in October before and after camp —
            see the{" "}
            <Link href="/events" className="text-camp-flame underline decoration-2 underline-offset-4">
              MYO events list
            </Link>{" "}
            for dates as they&apos;re confirmed.
          </p>
        </div>
      </section>

      {/* ACTIVITIES — illustrated grid */}
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">what fills the days</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Skills you<br />actually use.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                Not a passive four days. Every camper rotates through real hands-on stations. By Sunday they tie
                their own knots, light their own fire, and read a paper map.
              </p>
            </div>
            <div className="col-span-12 md:col-span-8">
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {campActivities.map((a, i) => (
                  <li
                    key={a.label}
                    className="group relative overflow-hidden border-2 border-camp-bark/30 bg-camp-paper p-5 transition hover:rotate-[-1deg] hover:border-camp-flame"
                    style={{ rotate: `${i % 2 ? 0.6 : -0.6}deg` }}
                  >
                    <div className="text-camp-flame">
                      <CampIcon name={a.icon} size={40} />
                    </div>
                    <div className="font-camp mt-3 text-2xl text-camp-bark">{a.label}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      {/* WEEK RHYTHM */}
      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-script text-2xl text-camp-flame">the rhythm</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Main camp, day by day.
              </h2>
            </div>
            <div className="font-script text-xl text-camp-bark/70">
              {formatRange(camp.campStart, camp.campEnd)}
            </div>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2">
            {campWeekRhythm.map((d, i) => (
              <li
                key={d.day}
                className="border-2 border-camp-bark/30 bg-camp-paper p-6"
                style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
              >
                <div className="flex items-baseline justify-between">
                  <div className="font-camp text-3xl text-camp-bark">{d.day}</div>
                  <div className="font-script text-xl text-camp-flame">{d.title}</div>
                </div>
                <p className="mt-3 leading-relaxed text-camp-ink/80">{d.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TopoDivider />

      {/* SPACES — illustrated photo cards */}
      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="font-script text-2xl text-camp-flame">around the grounds</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                The places<br />we live.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                Camp Smitty is a working camp the rest of the year. We rent the whole site for our session —
                cabins, kitchen, lake, woods, and all.
              </p>
              <div className="mt-8">
                <Link
                  href="/camp/location"
                  className="font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4 hover:text-camp-bark"
                >
                  Directions & logistics →
                </Link>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {campSpaces.map((s, i) => (
                  <article
                    key={s.title}
                    className="border-2 border-camp-bark/25 bg-camp-paper-soft"
                    style={{ rotate: `${(i % 3) - 1}deg` }}
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="font-camp text-lg text-camp-bark">{s.title}</div>
                      <div className="font-script text-base leading-tight text-camp-ink/75">{s.note}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-camp-bark text-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-amber">before camp begins</div>
            <h2 className="font-camp mt-2 text-5xl leading-[0.92] md:text-6xl">
              Three things to do<br />before <span className="text-camp-amber">August.</span>
            </h2>
          </div>
          <div className="col-span-12 grid gap-6 md:col-span-5">
            {[
              { num: "01", title: "Register your camper", to: "/camp/register" },
              { num: "02", title: "Read the rules & packing list", to: "/camp/rules" },
              { num: "03", title: "Plan drop-off & pickup", to: "/camp/location" }
            ].map((step, i) => (
              <Link
                key={step.num}
                href={step.to}
                className="group flex items-center justify-between border-b border-camp-paper/25 pb-4 transition hover:translate-x-1"
                style={{ marginTop: i === 0 ? 0 : "0.25rem" }}
              >
                <div>
                  <div className="font-script text-base text-camp-amber">step {step.num}</div>
                  <div className="font-camp mt-1 text-2xl">{step.title}</div>
                </div>
                <span className="font-camp text-3xl text-camp-amber transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
