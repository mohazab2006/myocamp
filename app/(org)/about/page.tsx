import type { Metadata } from "next";
import { ButtonLink } from "@/components/main/Button";

export const metadata: Metadata = {
  title: "About",
  description: "About Muslim Youth of Ottawa — volunteer-led since the 1980s."
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-brass">About MYO</div>
            <h1 className="headline-display mt-4 text-5xl md:text-7xl">
              A small community<br />
              with a long memory.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-4">
            <p className="text-lg leading-relaxed text-ink-soft">
              Muslim Youth of Ottawa has been running since the 1980s. Programs come and go — the camp,
              halaqas, hikes, fundraisers, mentorships — but the same volunteer instinct keeps it alive: build
              the kind of place you wished you had as a Muslim kid in Ottawa.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-paper-deep">
              <img src="/Pictures/assembly.jpg" alt="MYO closing assembly outdoors" className="h-full w-full object-cover" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Closing assembly · 2025</p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <h2 className="headline-display text-4xl md:text-5xl">What we&apos;re actually trying to build.</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                Ottawa is a city. Camp Smitty is in the woods. Most of what MYO does happens in the gap between
                those two — a halaqa in a basement community room, a hike that everyone underestimated, a
                Saturday cleanup at the food bank, a mentorship cohort that meets in a borrowed classroom.
              </p>
              <p>
                The camp is the loud part of the year. It&apos;s also where most of the kids first meet each
                other, and where most of the volunteer leaders find out they want to keep showing up.
              </p>
              <p>
                There&apos;s no professional staff. There&apos;s no office. There&apos;s a board of volunteers,
                a long list of parents who say yes when we ask, and a kitchen at Camp Smitty that has been
                feeding our kids for decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep/50">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-4">
            <div className="eyebrow text-brass">What we hold to</div>
            <h2 className="headline-display mt-3 text-4xl md:text-5xl">Five quiet rules.</h2>
          </div>
          <div className="col-span-12 grid gap-6 md:col-span-8 md:grid-cols-2">
            {[
              { n: "01", t: "Faith first, no apology.", b: "Salah on time. Quran in the morning. Friendly to anyone curious about it. Never preachy." },
              { n: "02", t: "Volunteer-led, always.", b: "No paid staff. No fundraising salaries. The work is done by people who care." },
              { n: "03", t: "Outside more than inside.", b: "Trails over screens. Fire pits over function halls. Nothing replaces a long hike." },
              { n: "04", t: "Subsidise quietly.", b: "Money is never the reason a youth doesn&apos;t come. We don&apos;t announce who is subsidised." },
              { n: "05", t: "Belong before you behave.", b: "We meet kids where they are. Manners come from being included, not from being lectured." }
            ].map((rule) => (
              <div key={rule.n} className="border-t border-line pt-5">
                <div className="text-xs uppercase tracking-[0.16em] text-brass">{rule.n}</div>
                <h3 className="font-display mt-2 text-2xl tracking-tight">{rule.t}</h3>
                <p
                  className="mt-2 max-w-[44ch] text-sm leading-relaxed text-ink-soft"
                  dangerouslySetInnerHTML={{ __html: rule.b }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-6 py-16 md:px-10">
          <div>
            <div className="eyebrow text-brass">Want in?</div>
            <h3 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
              Volunteer with us. Or just come on a hike.
            </h3>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/contact" variant="primary">Get in touch</ButtonLink>
            <ButtonLink href="/events" variant="secondary">See events</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
