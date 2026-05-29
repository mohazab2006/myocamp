import type { OrgEvent } from "../types";
import {
  fetchSupabaseEvent,
  fetchSupabaseEvents,
  isSupabaseConfigured
} from "@/lib/supabase/content";

// MSA Bonfire, LIT leadership track, and main camp are owner-confirmed.
// Past entries stay on the list for the archive. Supabase becomes the source once configured.
const seedEvents: OrgEvent[] = [
  {
    slug: "msa-bonfire-social-may-2026",
    title: "MSA Bonfire Social",
    type: "campfire",
    startDate: "2026-05-16",
    location: "Rideau River Provincial Park",
    audience: ["youth", "leaders"],
    blurb:
      "Not your average Saturday. Trails, workshops, games, prizes, dinner, s'mores, and a bonfire under the night sky. Hosted by AYJ MSA with workshops by MYO. Ages 16+.",
    body: "An evening to unwind, reconnect, and enjoy meaningful time with your friends and community. Trails and outdoor activities, workshops + Islamic reminders, games and prizes, dinner with s'mores and snacks, and a bonfire under the night sky. 2:00 PM – 10:30 PM. Free, registration required. Supported by Islamic Relief Canada.",
    heroImage: "/Pictures/msabonefire.png",
    registerUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScKEypc02nwQOrxD4Aq_91WhoiOyIAg5Wc9eVY_J_NaAk2gNQ/viewform",
    cost: "Free"
  },
  {
    slug: "myo-camp-lit-2026",
    title: "LIT Leadership Track 2026",
    type: "workshop",
    startDate: "2026-07-23",
    endDate: "2026-07-26",
    location: "Camp Smitty, Eganville",
    audience: ["leaders"],
    blurb:
      "Four-day leadership track for ages 17–19. Lighter logistics, more responsibility — meals, planning, and waking yourselves up.",
    body: "Staff arrive Wednesday at 6pm. LITs arrive Thursday morning. The session prepares senior youth to graduate into counsellor roles for the August main camp.",
    heroImage: "/Pictures/lit.JPG",
    registerUrl: "https://form.jotform.com/241729323092253",
    campSlug: "lit-camp-2026",
    cost: "TBD"
  },
  {
    slug: "myo-main-camp-2026",
    title: "MYO Main Camp 2026",
    type: "camp",
    startDate: "2026-08-06",
    endDate: "2026-08-09",
    location: "Camp Smitty, Eganville",
    audience: ["youth", "families"],
    blurb:
      "Ages 9–16. The full MYO camp experience — cabins, skills stations, prayer, and fire circles — in a focused four-day session.",
    body:
      "Staff arrive Wednesday at 6pm. Campers arrive Thursday morning. Registration, fees, location, rules, and the full camp story live on the MYO Summer Camp site.",
    heroImage: "/Pictures/verycoolcampfire.jpg",
    registerUrl: "/camp/register",
    campSlug: "main-camp-2026",
    cost: "$400"
  },
  // Past events
  {
    slug: "brothers-campfire-aug-2025",
    title: "Brothers' Campfire Night",
    type: "campfire",
    startDate: "2025-08-23",
    location: "Camp Smitty, fire pit",
    audience: ["youth"],
    blurb:
      "Closed out the camp week with stories around the boys' fire pit. Twenty-eight campers, three counsellors, no marshmallows survived.",
    heroImage: "/Pictures/bFirePit.jpg"
  },
  {
    slug: "sisters-trail-day-jul-2025",
    title: "Sisters' Trail Day",
    type: "hike",
    startDate: "2025-07-12",
    location: "Pinhey Forest",
    audience: ["youth", "leaders"],
    blurb:
      "Eight kilometres through Pinhey, navigation drills with a paper map and compass, lunch at the lookout.",
    heroImage: "/Pictures/trails.jpg"
  },
  {
    slug: "spring-fundraiser-2025",
    title: "Spring Fundraiser Dinner",
    type: "fundraiser",
    startDate: "2025-04-12",
    location: "Cathedral Hall",
    audience: ["all"],
    blurb:
      "Annual community dinner that funds camper subsidies. Raised $14,200 — enough to cover seventeen camp spots.",
    heroImage: "/Pictures/campPoster.jpg"
  }
];

export async function getEvents(): Promise<OrgEvent[]> {
  const supabaseEvents = await fetchSupabaseEvents();
  if (supabaseEvents !== null) return supabaseEvents;
  return seedEvents;
}

export async function getEvent(slug: string): Promise<OrgEvent | null> {
  if (isSupabaseConfigured()) {
    return fetchSupabaseEvent(slug);
  }
  return seedEvents.find((e) => e.slug === slug) ?? null;
}

/** Admin list: never show seed/demo events when Supabase is the content store. */
export async function getAdminEvents(): Promise<OrgEvent[]> {
  if (!isSupabaseConfigured()) return seedEvents;
  return (await fetchSupabaseEvents()) ?? [];
}

export async function getAdminEvent(slug: string): Promise<OrgEvent | null> {
  if (!isSupabaseConfigured()) {
    return seedEvents.find((event) => event.slug === slug) ?? null;
  }
  return fetchSupabaseEvent(slug);
}
