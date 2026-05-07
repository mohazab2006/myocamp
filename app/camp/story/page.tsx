import type { Metadata } from "next";
import { CampIcon, PaintedDivider } from "@/components/camp/Illustrations";

export const metadata: Metadata = {
  title: "Camp · Story",
  description: "What MYO Camp is, who runs it, and why we keep showing up at Camp Smitty every August."
};

export default function CampStoryPage() {
  return (
    <>
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
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
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="aspect-[4/5] overflow-hidden border-2 border-camp-bark/30">
                <img src="/Pictures/welcomeCabin.jpg" alt="Welcome cabin at Camp Smitty" className="h-full w-full object-cover" />
              </div>
              <div className="font-script mt-3 text-xl text-camp-bark/70">welcome cabin · arrival day</div>
            </div>
            <div className="col-span-12 space-y-6 text-lg leading-relaxed text-camp-ink/85 md:col-span-7">
              <p>
                Camp is run by volunteers — counsellors, lifeguards, cooks, drivers, medics, and the long list
                of parents who say yes when we ask. There&apos;s no professional camp company. There&apos;s no
                hired-out kitchen. Every meal, every fire, every cabin check is done by people who love this.
              </p>
              <p>
                We rent Camp Smitty in Eganville for the week. They&apos;ve hosted us for decades. They know
                our routine. They know our prayer times. The boat house has our name on the lifejacket
                inventory in their handwriting.
              </p>
              <p>
                We pick activities that build something — knots, fire-craft, navigation, archery, lashings —
                because at fourteen, learning that you can do hard things on your own is the actual lesson.
                Faith is the spine of the week, but it&apos;s not the schedule. It&apos;s how the schedule is run.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="font-script text-2xl text-camp-flame">five things we hold to</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                What you&apos;ll see by Tuesday.
              </h2>
            </div>
            <ul className="col-span-12 grid gap-5 md:col-span-7">
              {[
                { icon: "book", title: "Salah on time, every time.", body: "Five times a day, in the open. Visiting non-Muslim staff often join the dhuhr line by mid-week." },
                { icon: "knot", title: "Hard skills, taught right.", body: "Real knots, real fire-starting, real maps. We don&apos;t pad the curriculum with crafts you forget by Sunday." },
                { icon: "hand", title: "Cabins do the work.", body: "Mess hall duty, cabin cleanup, gear back where it belongs. Everyone serves, including the leaders." },
                { icon: "flame", title: "Fire-circle as the closer.", body: "Every night ends at the fire pit. Stories, prayer, snacks, laughter. No phones to distract from each other." },
                { icon: "compass", title: "Quiet at sunrise.", body: "Optional sunrise walk for anyone who wants it. The most-requested thing in the alumni emails." }
              ].map((p, i) => (
                <li
                  key={p.title}
                  className="flex gap-5 border-l-2 border-camp-flame/60 bg-camp-paper-soft px-5 py-5"
                  style={{ rotate: `${i % 2 ? 0.3 : -0.3}deg` }}
                >
                  <div className="text-camp-flame">
                    <CampIcon name={p.icon as never} size={36} />
                  </div>
                  <div>
                    <div className="font-camp text-2xl text-camp-bark">{p.title}</div>
                    <p
                      className="mt-1 text-camp-ink/80"
                      dangerouslySetInnerHTML={{ __html: p.body }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
