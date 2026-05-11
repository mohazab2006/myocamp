import type { Metadata } from "next";
import { Envelope, MapPin, Tent } from "@phosphor-icons/react/dist/ssr";
import { getSiteSettings } from "@/lib/content/org";
import { ButtonAnchor } from "@/components/main/Button";
import { PageHero } from "@/components/main/PageHero";
import { SocialLinks } from "@/components/main/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Muslim Youth of Ottawa."
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            One inbox, one team,
            <br />
            <span className="italic text-pine">we read everything.</span>
          </>
        }
        description="We don't have a phone line. The fastest way to reach us is email — usually a same-week reply, faster during camp registration season."
        action={
          <>
            <ButtonAnchor href={`mailto:${settings.email}`}>Send an email</ButtonAnchor>
            <ButtonAnchor
              href={settings.volunteerUrl}
              target="_blank"
              rel="noopener"
              variant="secondary"
            >
              Volunteer form
            </ButtonAnchor>
            <ButtonAnchor
              href={settings.newsletterUrl}
              target="_blank"
              rel="noopener"
              variant="secondary"
            >
              Adventure List
            </ButtonAnchor>
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-5xl gap-8 text-center md:grid-cols-2 md:gap-10 lg:grid-cols-4">
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-brass">
                <Envelope size={14} /> Email
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="font-display mt-3 block text-xl tracking-tight hover:text-pine md:text-2xl"
              >
                {settings.email}
              </a>
            </div>
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-brass">
                <MapPin size={14} /> Based in
              </div>
              <div className="mt-3 text-lg text-ink md:text-xl">Ottawa, Ontario</div>
              <div className="mt-1 text-sm text-ink-soft">
                No public office — we meet in mosques, parks, and the camp.
              </div>
            </div>
            <div className="border-t border-line pt-6">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-brass">
                <Tent size={14} /> Camp address
              </div>
              <div className="mt-3 text-lg text-ink md:text-xl">Camp Smitty</div>
              <div className="mt-1 text-sm text-ink-soft">98 Mink Lake Road, Eganville, ON</div>
            </div>
            <div className="border-t border-line pt-6">
              <div className="text-xs uppercase tracking-[0.18em] text-brass">Stay in the loop</div>
              <a
                href={settings.newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display mt-3 block text-xl tracking-tight hover:text-pine md:text-2xl"
              >
                MYO Adventure List
              </a>
              <div className="mt-4 flex justify-center">
                <SocialLinks links={settings.socials} />
              </div>
            </div>
          </div>

          <figure className="mx-auto mt-16 max-w-4xl md:mt-20">
            <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
              <img
                src="/Pictures/welcomeCabin.jpg"
                alt="Welcome cabin at MYO Camp Smitty"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-ink-soft">
              Welcome cabin &middot; Camp Smitty
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
