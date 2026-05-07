import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, HandCoins, Heart, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getSiteSettings } from "@/lib/content/org";
import { ButtonAnchor, ButtonLink } from "@/components/main/Button";

export const metadata: Metadata = {
  title: "Support MYO",
  description: "Donate, volunteer, or sponsor MYO programs and the camp."
};

export default async function SupportPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-brass">Support</div>
            <h1 className="headline-display mt-4 text-5xl md:text-7xl">
              Three ways to keep<br />
              <span className="italic text-pine">this thing going.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-4">
            <p className="text-lg leading-relaxed text-ink-soft">
              MYO is volunteer-run with a small annual budget. Subsidies, gear, and counsellor training are
              what we always need. Pick whichever lane fits.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
          <article className="col-span-12 md:col-span-4">
            <div className="text-pine"><HandCoins size={32} weight="duotone" /></div>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Donate</h2>
            <p className="mt-3 text-ink-soft">
              One-time or monthly. Donations go straight to camp subsidies, gear replacement, and program
              materials. PayPal handles tax receipts where applicable.
            </p>
            <div className="mt-6">
              <ButtonAnchor href={settings.donateUrl} target="_blank" rel="noopener">
                Donate via PayPal
              </ButtonAnchor>
            </div>
          </article>

          <article className="col-span-12 border-t border-line pt-8 md:col-span-4 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <div className="text-pine"><HandHeart size={32} weight="duotone" /></div>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Volunteer</h2>
            <p className="mt-3 text-ink-soft">
              Counsellors, kitchen help, lifeguards, drivers, weekend program leads. Tell us where you fit and
              we&apos;ll match you to the right thing — camp week or year-round.
            </p>
            <div className="mt-6">
              <ButtonAnchor href={settings.volunteerUrl} target="_blank" rel="noopener" variant="secondary">
                Volunteer form
              </ButtonAnchor>
            </div>
          </article>

          <article className="col-span-12 border-t border-line pt-8 md:col-span-4 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <div className="text-pine"><Heart size={32} weight="duotone" /></div>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Sponsor</h2>
            <p className="mt-3 text-ink-soft">
              Businesses and community partners can sponsor the spring fundraiser, cover counsellor training,
              or fund the kitchen for the week. Tax receipts and recognition where you&apos;d like it.
            </p>
            <div className="mt-6">
              <ButtonLink href="/contact" variant="secondary">Talk to us</ButtonLink>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep/50">
        <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-square overflow-hidden">
              <img src="/Pictures/coffeeStation.jpg" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow text-brass">What your support actually does</div>
            <h2 className="headline-display mt-3 text-4xl md:text-5xl">
              Real numbers, not vibes.
            </h2>
            <ul className="mt-8 divide-y divide-line">
              {[
                ["$50", "Covers a hike — bus, snacks, first-aid kit refresh."],
                ["$200", "Half a camper subsidy — travels with one kid all week."],
                ["$400", "A full camp spot for one camper or LIT."],
                ["$1,200", "Counsellor training cycle for two new volunteers."],
                ["$5,000", "Kitchen budget for a single camp week."]
              ].map(([amt, what]) => (
                <li key={amt} className="grid grid-cols-12 gap-4 py-5">
                  <div className="font-display col-span-3 text-2xl text-pine md:col-span-2">{amt}</div>
                  <div className="col-span-9 text-ink-soft md:col-span-10">{what}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-6 py-16 md:px-10">
          <div>
            <div className="eyebrow text-brass">Reach</div>
            <h3 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
              Other questions? Email us.
            </h3>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm text-pine hover:text-forest"
          >
            Contact page <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  );
}
