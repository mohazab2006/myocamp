import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getCampSettings } from "@/lib/content/camp";
import { CampIcon, PaintedDivider } from "@/components/camp/Illustrations";

export const metadata: Metadata = {
  title: "Camp · Location",
  description: "Camp Smitty in Eganville — directions, drop-off, pickup, and what the grounds look like."
};

export default async function CampLocationPage() {
  const camp = await getCampSettings();

  return (
    <>
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">where to find us</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Camp Smitty,<br />
              <span className="text-camp-flame">Eganville.</span>
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-camp-ink/85">
              About two hours west of Ottawa. The drive in is mostly highway, then a long quiet road past Lac
              des Loups. You&apos;ll know you&apos;re close when the cell signal drops.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden border-2 border-camp-bark/30">
              <img src="/Pictures/canoes2.jpg" alt="Canoes lined up at Camp Smitty" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="bg-camp-paper-soft">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
          <div className="col-span-12 md:col-span-4">
            <div className="font-script text-2xl text-camp-flame">the actual address</div>
            <h2 className="font-camp mt-2 text-4xl text-camp-bark md:text-5xl">98 Mink Lake Road</h2>
            <p className="mt-2 text-camp-ink/80">Eganville, Ontario</p>
            <p className="mt-1 text-sm text-camp-ink/65">~210 km from Ottawa city centre</p>
            <a
              href="https://maps.google.com/?q=Camp+Smitty+98+Mink+Lake+Rd+Eganville"
              target="_blank"
              rel="noopener"
              className="font-camp mt-4 inline-flex items-center gap-2 text-xl text-camp-flame underline decoration-2 underline-offset-4 hover:text-camp-bark"
            >
              Open in maps <ArrowUpRight size={18} weight="bold" />
            </a>
          </div>

          <ul className="col-span-12 grid gap-4 md:col-span-8 md:grid-cols-2">
            {[
              {
                icon: "tent",
                title: "Drop-off",
                detail: camp.dropOff,
                note: "Sunday window — exact time emailed to families closer to camp."
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
            ].map((row) => (
              <li
                key={row.title}
                className="flex gap-4 border-2 border-camp-bark/30 bg-camp-paper p-5"
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
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-3 px-6 py-12 md:px-10">
          {[
            "/Pictures/beach.jpg",
            "/Pictures/messHall.jpg",
            "/Pictures/trails.jpg",
            "/Pictures/treeHouse.jpg",
            "/Pictures/insideBCabin.jpg",
            "/Pictures/recHall.jpg"
          ].map((src, i) => (
            <div
              key={src}
              className={`overflow-hidden border-2 border-camp-bark/25 ${
                i === 0 ? "col-span-12 md:col-span-7 row-span-2" : "col-span-6 md:col-span-2"
              } aspect-[4/3]`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
