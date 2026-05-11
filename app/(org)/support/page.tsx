import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, HandCoins, Heart, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getSiteSettings } from "@/lib/content/org";
import { ButtonAnchor, ButtonLink } from "@/components/main/Button";
import { PageHero } from "@/components/main/PageHero";
import { SectionHeader } from "@/components/main/SectionHeader";

export const metadata: Metadata = {
  title: "Support MYO",
  description: "Donate, volunteer, or sponsor MYO programs and the camp."
};

export default async function SupportPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Support"
        title={
          <>
            Three ways to keep
            <br />
            <span className="italic text-pine">this thing going.</span>
          </>
        }
        description="MYO is volunteer-run with a small annual budget. Subsidies, gear, and counsellor training are what we always need. Pick whichever lane fits."
      />

      <section>
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            <article className="text-center">
              <div className="flex justify-center text-pine">
                <HandCoins size={40} weight="duotone" />
              </div>
              <h2 className="font-display mt-5 text-3xl tracking-tight md:text-4xl">Donate</h2>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-ink-soft md:text-lg">
                One-time or monthly. Donations go straight to camp subsidies, gear replacement, and program
                materials. PayPal handles tax receipts where applicable.
              </p>
              <div className="mt-7 flex justify-center">
                <ButtonAnchor href={settings.donateUrl} target="_blank" rel="noopener">
                  Donate via PayPal
                </ButtonAnchor>
              </div>
            </article>

            <article className="border-t border-line pt-10 text-center md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <div className="flex justify-center text-pine">
                <HandHeart size={40} weight="duotone" />
              </div>
              <h2 className="font-display mt-5 text-3xl tracking-tight md:text-4xl">Volunteer</h2>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-ink-soft md:text-lg">
                Counsellors, kitchen help, lifeguards, drivers, weekend program leads. Tell us where you fit
                and we&apos;ll match you to the right thing — camp week or year-round.
              </p>
              <div className="mt-7 flex justify-center">
                <ButtonAnchor href={settings.volunteerUrl} target="_blank" rel="noopener" variant="secondary">
                  Volunteer form
                </ButtonAnchor>
              </div>
            </article>

            <article className="border-t border-line pt-10 text-center md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <div className="flex justify-center text-pine">
                <Heart size={40} weight="duotone" />
              </div>
              <h2 className="font-display mt-5 text-3xl tracking-tight md:text-4xl">Sponsor</h2>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-ink-soft md:text-lg">
                Businesses and community partners can sponsor the spring fundraiser, cover counsellor
                training, or fund the kitchen for the week. Tax receipts and recognition where you&apos;d
                like it.
              </p>
              <div className="mt-7 flex justify-center">
                <ButtonLink href="/contact" variant="secondary">Talk to us</ButtonLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep/50">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            size="lg"
            eyebrow="What your support actually does"
            title="Real numbers, not vibes."
          />

          <ul className="mx-auto mt-14 max-w-3xl divide-y divide-line md:mt-16">
            {[
              ["$50", "Covers a hike — bus, snacks, first-aid kit refresh."],
              ["$200", "Half a camper subsidy — travels with one kid all week."],
              ["$400", "A full camp spot for one camper or LIT."],
              ["$1,200", "Counsellor training cycle for two new volunteers."],
              ["$5,000", "Kitchen budget for a single camp week."]
            ].map(([amt, what]) => (
              <li
                key={amt}
                className="grid grid-cols-12 items-baseline gap-4 py-6 md:py-7"
              >
                <div className="font-display col-span-12 text-3xl text-pine md:col-span-3 md:text-4xl">
                  {amt}
                </div>
                <div className="col-span-12 text-base leading-relaxed text-ink-soft md:col-span-9 md:text-lg">
                  {what}
                </div>
              </li>
            ))}
          </ul>

          <figure className="mx-auto mt-16 max-w-3xl md:mt-20">
            <div className="aspect-[16/10] overflow-hidden bg-paper">
              <img
                src="/Pictures/kitchenstaff.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </figure>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
          <SectionHeader
            eyebrow="Reach"
            title="Other questions? Email us."
            action={
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition hover:border-ink"
              >
                Contact page <ArrowUpRight size={14} weight="bold" />
              </Link>
            }
          />
        </div>
      </section>
    </>
  );
}
