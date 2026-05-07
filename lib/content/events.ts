import type { OrgEvent } from "../types";

const seedEvents: OrgEvent[] = [
  {
    slug: "myo-summer-camp-2026",
    title: "MYO Summer Camp 2026",
    type: "camp",
    startDate: "2026-08-16",
    endDate: "2026-08-22",
    location: "Camp Smitty, Eganville",
    audience: ["youth", "leaders"],
    blurb:
      "A week at Camp Smitty — cabins, canoes, fire-circles, prayer, leadership. Ages 9 to 16, plus LIT for ages 17–19.",
    heroImage: "/Pictures/canoes2.jpg",
    registerUrl: "https://form.jotform.com/241729323092253",
    registerOpens: "2026-06-29",
    registerCloses: "2026-07-24",
    cost: "$400"
  },
  {
    slug: "fall-hike-gatineau-2026",
    title: "Fall Hike — Gatineau Park",
    type: "hike",
    startDate: "2026-10-04",
    location: "Gatineau Park, Lac Pink loop",
    audience: ["families", "youth"],
    blurb:
      "Six kilometres through fall colours, with a stop at the lookout. Bring sturdy shoes and water — we provide the snacks.",
    heroImage: "/Pictures/trails.jpg",
    cost: "Free"
  },
  {
    slug: "knot-and-fire-workshop-nov-2026",
    title: "Knot & Fire Skills Workshop",
    type: "workshop",
    startDate: "2026-11-15",
    location: "MYO Hall, Ottawa",
    audience: ["youth", "leaders"],
    blurb:
      "Hands-on session: bowline, taut-line, figure-eight. Then ferro-rod fire-starting outside. Counts toward LIT prep.",
    heroImage: "/Pictures/bFirePit.jpg",
    cost: "$15"
  },
  {
    slug: "community-iftar-2027",
    title: "Community Iftar",
    type: "social",
    startDate: "2027-03-14",
    location: "Ottawa Mosque",
    audience: ["all"],
    blurb:
      "Open iftar for families, volunteers, and the wider community. Suhoor packs available for travelers.",
    heroImage: "/Pictures/messHall.jpg",
    cost: "Free"
  },
  {
    slug: "winter-service-day-2027",
    title: "Winter Service Day",
    type: "service",
    startDate: "2027-01-25",
    location: "Centretown Emergency Food Centre",
    audience: ["youth", "families"],
    blurb:
      "A morning packing meal kits and an afternoon delivering them. Service hours signed off for high-school students.",
    heroImage: "/Pictures/assembly.jpg",
    cost: "Free"
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
  return seedEvents;
}

export async function getEvent(slug: string): Promise<OrgEvent | null> {
  return seedEvents.find((e) => e.slug === slug) ?? null;
}
