import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content/org";
import { CampIcon, PaintedDivider, SectionScatter } from "@/components/camp/Illustrations";

import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Camp · Support",
  description:
    "Subsidise a camper, donate gear, or volunteer for the week at MYO Camp. Donate via PayPal or e-Transfer at myo.camp.",
  path: "/camp/support"
});

export default async function CampSupportPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="topo-bg relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="firey" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">help one camper get to camp</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Subsidise a spot.<br />
              <span className="text-camp-flame">Quietly.</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-camp-ink/85">
              Every year families ask if there&apos;s help available. There always is — because of donations.
              Names are never shared. The kid never knows who paid. They just get to come.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden border-2 border-camp-bark/30">
              <img
                src="/Pictures/basketball.jpg"
                alt="Campers playing basketball at Camp Smitty"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="relative isolate overflow-hidden bg-camp-paper-soft">
        <SectionScatter variant="route" />
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">where it goes</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Three lanes.
              </h2>
            </div>
            <div className="col-span-12 grid gap-5 md:col-span-8 md:grid-cols-3">
              {[
                {
                  icon: "tent",
                  amt: "$400",
                  title: "Send a camper",
                  body: "Covers a full spot for one youth. Most-requested kind of donation."
                },
                {
                  icon: "knife",
                  amt: "$1,200",
                  title: "Train counsellors",
                  body: "First aid, lifeguard, food safety. We re-certify every year."
                },
                {
                  icon: "flame",
                  amt: "$5,000",
                  title: "Cover the kitchen",
                  body: "Halal meals for the whole week, plus pre-camp staff training food."
                }
              ].map((tier, i) => (
                <article
                  key={tier.title}
                  className="border-2 border-camp-bark/30 bg-camp-paper p-6"
                  style={{ rotate: `${i % 2 ? 0.5 : -0.5}deg` }}
                >
                  <div className="text-camp-flame">
                    <CampIcon name={tier.icon as never} size={36} />
                  </div>
                  <div className="font-camp mt-3 text-3xl text-camp-bark">{tier.amt}</div>
                  <div className="font-script text-xl text-camp-flame">{tier.title}</div>
                  <p className="mt-3 text-camp-ink/80">{tier.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={settings.donateUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border-2 border-camp-ink bg-camp-flame px-6 py-3 text-sm font-medium text-camp-paper transition hover:translate-y-[-1px]"
              >
                Donate via PayPal
              </a>
              <a
                href={settings.volunteerUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border-2 border-camp-ink/80 bg-camp-paper px-6 py-3 text-sm font-medium text-camp-ink transition hover:rotate-[1deg]"
              >
                Volunteer for camp
              </a>
            </div>
            <p className="max-w-md text-center text-sm leading-relaxed text-camp-ink/75">
              Prefer e-Transfer? Send to{" "}
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-camp-bark underline decoration-camp-bark/30 underline-offset-2"
              >
                {settings.email}
              </a>{" "}
              — put &ldquo;Donation&rdquo; in the message so we know it&apos;s a gift, not camp fees.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
