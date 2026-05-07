import type { Metadata } from "next";
import { getEvents } from "@/lib/content/events";
import { EventFilters } from "@/components/main/EventFilters";

export const metadata: Metadata = {
  title: "Events",
  description: "Hikes, halaqas, service days, and the camp — everything MYO is running."
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
      <header className="grid grid-cols-12 gap-6 border-b border-line pb-12 md:gap-10">
        <div className="col-span-12 md:col-span-7">
          <div className="eyebrow text-brass">Events</div>
          <h1 className="headline-display mt-3 text-5xl md:text-7xl">
            Where to find us next.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-5 md:pt-3">
          <p className="max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            Single-day events and seasonal trips. Past events stay on this page so people can see what we&apos;ve
            been up to and decide what to join next time.
          </p>
        </div>
      </header>

      <div className="mt-12">
        <EventFilters events={events} />
      </div>
    </section>
  );
}
