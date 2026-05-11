import type { Metadata } from "next";
import { ButtonLink } from "@/components/main/Button";
import { PageHero } from "@/components/main/PageHero";
import { SectionHeader } from "@/components/main/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description: "About Muslim Youth of Ottawa — volunteer-led since the 1980s."
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About MYO"
        title={
          <>
            A small community
            <br />
            with a long memory.
          </>
        }
        description="Muslim Youth of Ottawa has been running since the 1980s. Programs come and go — the camp, halaqas, hikes, fundraisers, mentorships — but the same volunteer instinct keeps it alive: build the kind of place you wished you had as a Muslim kid in Ottawa."
      />

      <section>
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            size="lg"
            title="What we're actually trying to build."
            description="Ottawa is a city. Camp Smitty is in the woods. Most of what MYO does happens in the gap between those two — a halaqa in a basement community room, a hike that everyone underestimated, a Saturday cleanup at the food bank, a mentorship cohort that meets in a borrowed classroom."
          />

          <div className="mx-auto mt-14 max-w-3xl space-y-6 text-lg leading-relaxed text-ink-soft md:mt-16 md:text-xl">
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

          <figure className="mx-auto mt-16 max-w-4xl md:mt-20">
            <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
              <img
                src="/Pictures/kidswiththobes.JPG"
                alt="MYO youth gathered for Jumu'ah at Camp Smitty"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-ink-soft">
              Jumu&apos;ah at Camp Smitty
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep/50">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            eyebrow="What we hold to"
            title="Five quiet rules."
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-x-10 gap-y-10 md:mt-16 md:grid-cols-2">
            {[
              { n: "01", t: "Faith first, no apology.", b: "Salah on time. Quran in the morning. Friendly to anyone curious about it. Never preachy." },
              { n: "02", t: "Volunteer-led, always.", b: "No paid staff. No fundraising salaries. The work is done by people who care." },
              { n: "03", t: "Outside more than inside.", b: "Trails over screens. Fire pits over function halls. Nothing replaces a long hike." },
              { n: "04", t: "Subsidise quietly.", b: "Money is never the reason a youth doesn&apos;t come. We don&apos;t announce who is subsidised." },
              { n: "05", t: "Belong before you behave.", b: "We meet kids where they are. Manners come from being included, not from being lectured." }
            ].map((rule) => (
              <div key={rule.n} className="border-t border-line pt-6">
                <div className="text-xs uppercase tracking-[0.18em] text-brass">{rule.n}</div>
                <h3 className="font-display mt-3 text-2xl tracking-tight md:text-3xl">{rule.t}</h3>
                <p
                  className="mt-3 text-base leading-relaxed text-ink-soft md:text-lg"
                  dangerouslySetInnerHTML={{ __html: rule.b }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
          <SectionHeader
            eyebrow="Want in?"
            title="Volunteer with us. Or just come on a hike."
            description="Counsellor crews, weekend programs, kitchen help, hike-day drivers — there's almost always something to step into."
            action={
              <>
                <ButtonLink href="/contact" variant="primary">Get in touch</ButtonLink>
                <ButtonLink href="/events" variant="secondary">See events</ButtonLink>
              </>
            }
          />
        </div>
      </section>
    </>
  );
}
