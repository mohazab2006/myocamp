import type { Metadata } from "next";
import Link from "next/link";
import {
  CampIcon,
  PaintedDivider,
  TopoDivider
} from "@/components/camp/Illustrations";
import {
  campStoryChapters,
  campStoryMoments,
  campStorySnapshots
} from "@/lib/content/camp";

export const metadata: Metadata = {
  title: "Camp · Story",
  description: "What MYO Camp is, who runs it, and why we keep showing up at Camp Smitty every August."
};

export default function CampStoryPage() {
  return (
    <>
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-7">
              <div className="font-script text-2xl text-camp-flame">field journal · the story</div>
              <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
                <span className="scribble-underline">Why we&apos;re here.</span>
              </h1>
            </div>
            <div className="col-span-12 md:col-span-5 md:pt-8">
              <p className="text-lg leading-relaxed text-camp-ink/85">
                MYO Camp started as a simple idea: get Muslim kids out of the city for a week, into the woods,
                with people who&apos;ll teach them how to start a fire and pray on time. Forty-some years later
                that&apos;s still the brief.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-camp-ink/85">
                The photos below are not stock. They are Thursday arrival, Friday assembly, canoe lines, and
                the fire pit after maghrib — the week as families and alumni already know it.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-4">
            {campStorySnapshots.map((shot, i) => (
              <figure
                key={shot.src}
                className="group overflow-hidden border-2 border-camp-bark/25 bg-camp-paper-soft"
                style={{ rotate: `${(i % 2 ? 1 : -1) * 0.6}deg` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="border-t border-camp-bark/15 p-3">
                  <div className="font-camp text-lg text-camp-bark">{shot.caption}</div>
                  <div className="font-script text-base leading-tight text-camp-ink/70">{shot.note}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <PaintedDivider />

      {campStoryChapters.map((chapter, chapterIndex) => (
        <section
          key={chapter.title}
          className={chapterIndex % 2 ? "bg-camp-paper" : "bg-camp-paper-soft"}
        >
          <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
            <div className="grid grid-cols-12 items-start gap-6 md:gap-10">
              <div
                className={`col-span-12 space-y-5 md:col-span-5 ${
                  chapterIndex % 2 ? "md:order-2" : ""
                }`}
              >
                <div className="font-script text-2xl text-camp-flame">{chapter.eyebrow}</div>
                <h2 className="font-camp text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                  {chapter.title}
                </h2>
                {chapter.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-relaxed text-camp-ink/85">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div
                className={`col-span-12 grid gap-4 md:col-span-7 ${
                  chapterIndex % 2 ? "md:order-1" : ""
                }`}
              >
                {chapter.images.map((image, imageIndex) => (
                  <figure
                    key={image.src}
                    className={`overflow-hidden border-2 border-camp-bark/30 bg-camp-paper ${
                      imageIndex === 0 ? "md:mr-10" : "md:ml-10 md:mt-6"
                    }`}
                    style={{ rotate: `${imageIndex % 2 ? 0.8 : -0.8}deg` }}
                  >
                    <div className={`overflow-hidden ${imageIndex === 0 ? "aspect-[5/4]" : "aspect-[4/3]"}`}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="painted-edge h-full w-full object-cover"
                      />
                    </div>
                    <figcaption className="flex items-baseline justify-between gap-4 border-t border-camp-bark/15 px-4 py-3">
                      <div className="font-camp text-xl text-camp-bark">{image.caption}</div>
                      <div className="font-script text-base text-camp-ink/70">{image.note}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-camp-bark text-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden border-2 border-camp-paper/20">
              <img
                src="/Pictures/verycoolcampfire.jpg"
                alt="Campers laughing around the fire pit after dark"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="col-span-12 flex flex-col justify-center md:col-span-7">
            <div className="font-script text-2xl text-camp-amber">what alumni write back</div>
            <blockquote className="font-camp mt-4 text-4xl leading-[1.05] md:text-5xl">
              &ldquo;I did not know I could tie that knot, swim that far, or pray in the open like that until
              camp showed me.&rdquo;
            </blockquote>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-camp-paper/80">
              That line shows up in emails every year. It is why we keep the week short on screens and long on
              skills, salah, and time around the fire.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { stat: "40+", label: "years on the lake" },
                { stat: "100%", label: "volunteer-run" },
                { stat: "4", label: "nights away from the city" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-[9rem] border border-camp-paper/20 px-4 py-3"
                >
                  <div className="font-camp text-3xl text-camp-amber">{item.stat}</div>
                  <div className="mt-1 text-sm text-camp-paper/75">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TopoDivider />

      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">before you arrive</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Moments you&apos;ll recognize by Tuesday.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                Not a brochure list — the places and rituals campers talk about all year: the swim test, the
                tree house, the rec hall, the court behind the cabins.
              </p>
            </div>

            <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-8 md:grid-cols-3 md:gap-4">
              {campStoryMoments.map((moment, i) => (
                <figure
                  key={moment.src}
                  className={`overflow-hidden border-2 border-camp-bark/25 bg-camp-paper-soft ${
                    i === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""
                  }`}
                  style={{ rotate: `${(i % 3) - 1}deg` }}
                >
                  <div className={`overflow-hidden ${i === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                    <img src={moment.src} alt={moment.alt} className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="p-3">
                    <div className="font-camp text-lg text-camp-bark">{moment.caption}</div>
                    <div className="font-script text-base leading-tight text-camp-ink/75">{moment.note}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="font-script text-2xl text-camp-flame">five things we hold to</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                What you&apos;ll see by Tuesday.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                The week has structure. These are the non-negotiables counsellors repeat until they are habit.
              </p>
            </div>
            <ul className="col-span-12 grid gap-5 md:col-span-7">
              {[
                {
                  icon: "book",
                  title: "Salah on time, every time.",
                  body: "Five times a day, in the open. Visiting non-Muslim staff often join the dhuhr line by mid-week."
                },
                {
                  icon: "knot",
                  title: "Hard skills, taught right.",
                  body: "Real knots, real fire-starting, real maps. We don't pad the curriculum with crafts you forget by Sunday."
                },
                {
                  icon: "hand",
                  title: "Cabins do the work.",
                  body: "Mess hall duty, cabin cleanup, gear back where it belongs. Everyone serves, including the leaders."
                },
                {
                  icon: "flame",
                  title: "Fire-circle as the closer.",
                  body: "Every night ends at the fire pit. Stories, prayer, snacks, laughter. No phones to distract from each other."
                },
                {
                  icon: "compass",
                  title: "Quiet at sunrise.",
                  body: "Optional sunrise walk for anyone who wants it. The most-requested thing in the alumni emails."
                }
              ].map((principle, i) => (
                <li
                  key={principle.title}
                  className="flex gap-5 border-l-2 border-camp-flame/60 bg-camp-paper px-5 py-5"
                  style={{ rotate: `${i % 2 ? 0.3 : -0.3}deg` }}
                >
                  <div className="text-camp-flame">
                    <CampIcon name={principle.icon as never} size={36} />
                  </div>
                  <div>
                    <div className="font-camp text-2xl text-camp-bark">{principle.title}</div>
                    <p className="mt-1 text-camp-ink/80">{principle.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">ready for August</div>
            <h2 className="font-camp mt-2 text-5xl leading-[0.92] text-camp-bark md:text-6xl">
              Read the story. Then plan the week.
            </h2>
            <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-camp-ink/85">
              Registration, packing, and drop-off logistics live on the other camp pages — start there once you
              know this is the week your kid wants.
            </p>
          </div>
          <div className="col-span-12 flex flex-col justify-center gap-4 md:col-span-5">
            <Link
              href="/camp/register"
              className="font-camp border-2 border-camp-bark bg-camp-flame px-6 py-4 text-center text-2xl text-camp-paper transition hover:bg-camp-bark"
            >
              Register for camp
            </Link>
            <Link
              href="/camp/location"
              className="font-camp border-2 border-camp-bark/30 px-6 py-4 text-center text-2xl text-camp-bark transition hover:border-camp-flame hover:text-camp-flame"
            >
              See where we gather
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
