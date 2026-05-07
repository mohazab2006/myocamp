import type { Metadata } from "next";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import {
  campCodeOfConduct,
  leaveAtHome,
  packingList
} from "@/lib/content/camp";
import { PaintedDivider } from "@/components/camp/Illustrations";

export const metadata: Metadata = {
  title: "Camp · Rules & packing",
  description: "Camp expectations, packing list, and what to leave home."
};

export default function CampRulesPage() {
  return (
    <>
      <section className="topo-bg bg-camp-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">cabin rules · packing list</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Read this twice<br />
              <span className="text-camp-flame">before Sunday.</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-camp-ink/85">
              Clear expectations make the week easier on everyone — campers, parents, counsellors. Most of
              this is common sense; some of it is hard-won from previous summers.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="border-2 border-camp-bark/30 bg-camp-paper-soft p-6">
              <div className="font-script text-xl text-camp-flame">if it helps,</div>
              <div className="font-camp mt-1 text-2xl text-camp-bark">print this page.</div>
              <p className="mt-3 text-camp-ink/80">
                We send this to every parent the week of camp. Bringing a printed copy on drop-off Sunday
                speeds up cabin assignments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="bg-camp-paper-soft">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="font-script text-2xl text-camp-flame">cabin code</div>
              <h2 className="font-camp mt-2 text-5xl leading-[0.95] text-camp-bark md:text-6xl">
                Six rules<br />we won&apos;t bend.
              </h2>
            </div>
            <ol className="col-span-12 space-y-4 md:col-span-7">
              {campCodeOfConduct.map((rule, i) => (
                <li
                  key={rule}
                  className="flex gap-4 border-2 border-camp-bark/30 bg-camp-paper px-5 py-4"
                >
                  <div className="font-camp shrink-0 text-3xl text-camp-flame">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-lg text-camp-ink/85">{rule}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 border-r-0 md:col-span-6 md:border-r-2 md:border-camp-bark/20 md:pr-10">
              <div className="flex items-baseline gap-3">
                <div className="font-camp text-5xl text-camp-moss md:text-6xl">Bring</div>
                <div className="font-script text-2xl text-camp-bark/70">things to pack</div>
              </div>
              <ul className="mt-8 space-y-2">
                {packingList.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-dashed border-camp-bark/30 pb-2"
                  >
                    <Check size={18} weight="bold" className="mt-1 shrink-0 text-camp-moss" />
                    <span className="text-camp-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 mt-8 md:col-span-6 md:mt-0 md:pl-10">
              <div className="flex items-baseline gap-3">
                <div className="font-camp text-5xl text-camp-flame md:text-6xl">Leave home</div>
                <div className="font-script text-2xl text-camp-bark/70">do not pack</div>
              </div>
              <ul className="mt-8 space-y-2">
                {leaveAtHome.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-dashed border-camp-bark/30 pb-2"
                  >
                    <X size={18} weight="bold" className="mt-1 shrink-0 text-camp-flame" />
                    <span className="text-camp-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
