import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import {
  campArrivalNotes,
  campDriveSteps,
  campMapEmbedUrl,
  campSpaces,
  getCampSettings
} from "@/lib/content/camp";
import { CampIcon, PaintedDivider, TopoDivider } from "@/components/camp/Illustrations";

export const metadata: Metadata = {
  title: "Camp · Location",
  description: "Camp Smitty in Eganville — directions, drop-off, pickup, and what the grounds look like."
};

export default async function CampLocationPage() {
  const camp = await getCampSettings();

  return (
    <>
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-7">
              <div className="font-script text-2xl text-camp-flame">where to find us</div>
              <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
                Camp Smitty,
                <br />
                <span className="text-camp-flame">Eganville.</span>
              </h1>
              <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-camp-ink/85">
                About two hours west of Ottawa. The drive in is mostly highway, then a long quiet road past Lac
                des Loups. You&apos;ll know you&apos;re close when the cell signal drops.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { stat: "~2 hr", label: "from Ottawa" },
                  { stat: "210 km", label: "city centre" },
                  { stat: "Patchy", label: "phone signal" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-2 border-camp-bark/25 bg-camp-paper-soft px-4 py-3"
                  >
                    <div className="font-camp text-2xl text-camp-bark">{item.stat}</div>
                    <div className="font-script text-base text-camp-ink/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 grid gap-4 md:col-span-5">
              <figure
                className="overflow-hidden border-2 border-camp-bark/30 bg-camp-paper-soft"
                style={{ rotate: "-0.6deg" }}
              >
                <div className="aspect-[5/4] overflow-hidden">
                  <img
                    src="/Pictures/canoes2.jpg"
                    alt="Canoes lined up at Camp Smitty"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="border-t border-camp-bark/15 px-4 py-3">
                  <div className="font-camp text-xl text-camp-bark">Waterfront</div>
                  <div className="font-script text-base text-camp-ink/70">first thing most campers run toward</div>
                </figcaption>
              </figure>
              <figure
                className="overflow-hidden border-2 border-camp-bark/30 bg-camp-paper-soft md:ml-8 md:mt-6"
                style={{ rotate: "0.8deg" }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src="/Pictures/welcomeCabin.jpg"
                    alt="Welcome cabin at camp check-in"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="border-t border-camp-bark/15 px-4 py-3">
                  <div className="font-camp text-xl text-camp-bark">Welcome cabin</div>
                  <div className="font-script text-base text-camp-ink/70">drop-off and check-in</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">the actual address</div>
              <h2 className="font-camp mt-2 text-4xl text-camp-bark md:text-5xl">98 Mink Lake Road</h2>
              <p className="mt-2 text-lg text-camp-ink/80">Eganville, Ontario</p>
              <p className="mt-1 text-sm text-camp-ink/65">~210 km from Ottawa city centre</p>
              <a
                href="https://maps.google.com/?q=Camp+Smitty+98+Mink+Lake+Rd+Eganville"
                target="_blank"
                rel="noopener"
                className="font-camp mt-6 inline-flex items-center gap-2 text-xl text-camp-flame underline decoration-2 underline-offset-4 hover:text-camp-bark"
              >
                Open in maps <ArrowUpRight size={18} weight="bold" />
              </a>
            </div>

            <ol className="col-span-12 grid gap-4 md:col-span-8">
              {campDriveSteps.map((step, i) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[auto_1fr] gap-4 border-2 border-camp-bark/30 bg-camp-paper p-5"
                  style={{ rotate: `${i % 2 ? 0.3 : -0.3}deg` }}
                >
                  <div className="font-camp text-4xl leading-none text-camp-flame">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-camp text-2xl text-camp-bark">{step.title}</div>
                    <p className="mt-2 leading-relaxed text-camp-ink/80">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">drop-off & pickup</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Plan the drive once. Show up calm.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                Exact Thursday morning times and closing-assembly details go out to registered families closer
                to camp. Use this page for the route, the address, and what to expect at the gate.
              </p>
            </div>

            <ul className="col-span-12 grid gap-4 md:col-span-8 md:grid-cols-2">
              {[
                {
                  icon: "tent",
                  title: "Drop-off",
                  detail: camp.dropOff,
                  note: "Thursday morning — exact time emailed to families closer to camp."
                },
                {
                  icon: "spark",
                  title: "Pickup",
                  detail: camp.pickUp,
                  note: "Closing assembly first, then pickup. Plan to be there by 11:45."
                },
                {
                  icon: "compass",
                  title: "From Ottawa",
                  detail: "~2.0 hours via Hwy 17",
                  note: "Carpools coordinated by cabin group. We share a sheet by July."
                },
                {
                  icon: "moon",
                  title: "Phone signal",
                  detail: "Patchy at best",
                  note: "There is a camp phone. Numbers shared with families before drop-off."
                }
              ].map((row, i) => (
                <li
                  key={row.title}
                  className="flex gap-4 border-2 border-camp-bark/30 bg-camp-paper-soft p-5"
                  style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
                >
                  <div className="text-camp-flame">
                    <CampIcon name={row.icon as never} size={36} />
                  </div>
                  <div>
                    <div className="font-camp text-2xl text-camp-bark">{row.title}</div>
                    <div className="text-base text-camp-ink">{row.detail}</div>
                    <div className="mt-1 text-sm text-camp-ink/70">{row.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 overflow-hidden border-2 border-camp-bark/30 bg-camp-paper-soft">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-camp-bark/15 px-5 py-4">
              <div>
                <div className="font-script text-xl text-camp-flame">map</div>
                <div className="font-camp text-3xl text-camp-bark">Find the turnoff on Mink Lake Road</div>
              </div>
              <a
                href="https://maps.google.com/?q=Camp+Smitty+98+Mink+Lake+Rd+Eganville"
                target="_blank"
                rel="noopener"
                className="font-camp inline-flex items-center gap-2 text-lg text-camp-flame underline decoration-2 underline-offset-4 hover:text-camp-bark"
              >
                Full-screen directions <ArrowUpRight size={16} weight="bold" />
              </a>
            </div>
            <iframe
              title="Camp Smitty on Google Maps"
              src={campMapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[280px] w-full border-0 md:h-[420px]"
            />
          </div>
        </div>
      </section>

      <TopoDivider />

      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-4">
              <div className="font-script text-2xl text-camp-flame">on the grounds</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                The places you&apos;ll walk past all week.
              </h2>
              <p className="mt-6 max-w-[44ch] text-camp-ink/80">
                MYO rents the full site for the session — cabins, kitchen, lake, woods, and activity areas.
                These are the landmarks families ask about first.
              </p>
            </div>

            <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-8 md:grid-cols-3 md:gap-4">
              {campSpaces.map((space, i) => (
                <article
                  key={space.title}
                  className="overflow-hidden border-2 border-camp-bark/25 bg-camp-paper"
                  style={{ rotate: `${(i % 3) - 1}deg` }}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={space.image} alt={space.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="font-camp text-lg text-camp-bark">{space.title}</div>
                    <div className="font-script text-base leading-tight text-camp-ink/75">{space.note}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-5">
            <div className="font-script text-2xl text-camp-flame">first hour on site</div>
            <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
              What to have ready at the welcome cabin.
            </h2>
          </div>
          <ul className="col-span-12 grid gap-4 md:col-span-7">
            {campArrivalNotes.map((note, i) => (
              <li
                key={note}
                className="flex gap-4 border-l-2 border-camp-flame/60 bg-camp-paper-soft px-5 py-4"
                style={{ rotate: `${i % 2 ? 0.25 : -0.25}deg` }}
              >
                <div className="font-camp text-2xl text-camp-flame">{String(i + 1).padStart(2, "0")}</div>
                <p className="text-camp-ink/85">{note}</p>
              </li>
            ))}
          </ul>
          <div className="col-span-12 flex flex-wrap gap-4 md:col-span-7 md:col-start-6">
            <Link
              href="/camp/register"
              className="font-camp border-2 border-camp-bark bg-camp-flame px-6 py-3 text-xl text-camp-paper transition hover:bg-camp-bark"
            >
              Register for camp
            </Link>
            <Link
              href="/camp/rules"
              className="font-camp border-2 border-camp-bark/30 px-6 py-3 text-xl text-camp-bark transition hover:border-camp-flame hover:text-camp-flame"
            >
              Rules & packing list
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
