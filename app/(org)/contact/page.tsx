import type { Metadata } from "next";
import { Envelope, MapPin, Tent } from "@phosphor-icons/react/dist/ssr";
import { getSiteSettings } from "@/lib/content/org";
import { ButtonAnchor } from "@/components/main/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Muslim Youth of Ottawa."
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-28">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-7">
          <div className="eyebrow text-brass">Contact</div>
          <h1 className="headline-display mt-4 text-5xl md:text-7xl">
            One inbox, one team,<br />
            <span className="italic text-pine">we read everything.</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
            We don&apos;t have a phone line. The fastest way to reach us is email — usually a same-week reply,
            faster during camp registration season.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="border-t border-line pt-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <Envelope size={14} /> Email
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="font-display mt-2 block text-2xl tracking-tight hover:text-pine"
              >
                {settings.email}
              </a>
            </div>
            <div className="border-t border-line pt-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <MapPin size={14} /> Based in
              </div>
              <div className="mt-2 text-base text-ink">Ottawa, Ontario</div>
              <div className="text-sm text-ink-soft">No public office — we meet in mosques, parks, and the camp.</div>
            </div>
            <div className="border-t border-line pt-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
                <Tent size={14} /> Camp address
              </div>
              <div className="mt-2 text-base text-ink">Camp Smitty</div>
              <div className="text-sm text-ink-soft">98 Mink Lake Road, Eganville, ON</div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonAnchor href={`mailto:${settings.email}`}>Send an email</ButtonAnchor>
            <ButtonAnchor href={settings.volunteerUrl} target="_blank" rel="noopener" variant="secondary">
              Volunteer form
            </ButtonAnchor>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-paper-deep">
            <img
              src="/Pictures/welcomeCabin.jpg"
              alt="Welcome cabin at MYO Camp Smitty"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">
            Welcome cabin · Camp Smitty
          </p>
        </div>
      </div>
    </section>
  );
}
