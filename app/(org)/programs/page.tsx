import type { Metadata } from "next";
import { getPrograms } from "@/lib/content/programs";
import { ProgramFilters } from "@/components/main/ProgramFilters";

export const metadata: Metadata = {
  title: "Programs",
  description: "Year-round programs for MYO youth, leaders, and families."
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
      <header className="grid grid-cols-12 gap-6 border-b border-line pb-12 md:gap-10">
        <div className="col-span-12 md:col-span-7">
          <div className="eyebrow text-brass">Programs</div>
          <h1 className="headline-display mt-3 text-5xl md:text-7xl">
            Where the year keeps moving.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-5 md:pt-3">
          <p className="max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            Recurring programs we run between the events. Halaqas, mentorships, fitness, skills clinics. Past
            programs stay listed so we can dust them off when there&apos;s capacity again.
          </p>
        </div>
      </header>

      <div className="mt-12">
        <ProgramFilters programs={programs} />
      </div>
    </section>
  );
}
