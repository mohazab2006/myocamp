import type { Metadata } from "next";
import { getEvents } from "@/lib/content/events";
import { EventFilters } from "@/components/main/EventFilters";
import { PageHero } from "@/components/main/PageHero";

export const metadata: Metadata = {
  title: "Events",
  description: "Hikes, halaqas, service days, and the camp — everything MYO is running."
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Where to find us next."
        description="Single-day events and seasonal trips. Past events stay on this page so people can see what we've been up to and decide what to join next time."
      />

      <section>
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <EventFilters events={events} />
        </div>
      </section>
    </>
  );
}
