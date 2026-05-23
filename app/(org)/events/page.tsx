import type { Metadata } from "next";
import { getEvents } from "@/lib/content/events";
import { fetchFeaturedPublicCamps, fetchPublicCampsIndex } from "@/lib/content/camps-public";
import { EventFilters } from "@/components/main/EventFilters";
import { FeaturedCampCards } from "@/components/main/EventCampPanel";
import { PageHero } from "@/components/main/PageHero";

export const metadata: Metadata = {
  title: "Events",
  description: "Hikes, halaqas, service days, and the camp — everything MYO is running."
};

export default async function EventsPage() {
  const [events, featuredCamps, campIndex] = await Promise.all([
    getEvents(),
    fetchFeaturedPublicCamps(),
    fetchPublicCampsIndex()
  ]);

  const linkedCampsBySlug = Object.fromEntries(
    campIndex.map((camp) => [
      camp.slug,
      {
        slug: camp.slug,
        title: camp.title,
        heroImage: camp.heroImage,
        registerPath: camp.registerPath
      }
    ])
  );

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Where to find us next."
        description="Camp sessions and community events in one place — bonfires, hikes, fundraisers, and summer camp registration."
      />

      <FeaturedCampCards camps={featuredCamps} />

      <section>
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <EventFilters events={events} linkedCampsBySlug={linkedCampsBySlug} />
        </div>
      </section>
    </>
  );
}
