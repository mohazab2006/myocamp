import type { CampSettings } from "../types";

export async function getCampSettings(): Promise<CampSettings> {
  return {
    registrationStatus: "opening-soon",
    registrationOpens: "2026-06-29",
    registrationDeadline: "2026-07-24",
    campStart: "2026-08-16",
    campEnd: "2026-08-22",
    formUrl: "https://form.jotform.com/241729323092253",
    feeCamper: 400,
    feeLit: 400,
    dropOff: "Sunday afternoon",
    pickUp: "Saturday at noon",
    paymentEmail: "myoadmin@gmail.com",
    paypalDonateId: "PVVD32WHTA9KE"
  };
}

export const campActivities = [
  { label: "Quran & reflection", icon: "book" },
  { label: "Canoeing", icon: "canoe" },
  { label: "Swimming", icon: "wave" },
  { label: "Knots & lashings", icon: "knot" },
  { label: "Fire-starting", icon: "flame" },
  { label: "Bow & arrow", icon: "bow" },
  { label: "Trail navigation", icon: "compass" },
  { label: "Cabin life", icon: "tent" },
  { label: "Camp-wide games", icon: "spark" },
  { label: "Service projects", icon: "hand" },
  { label: "Arts & crafts", icon: "leaf" },
  { label: "Storytelling", icon: "moon" }
] as const;

export const campSpaces = [
  {
    title: "Cabins",
    image: "/Pictures/girlsCabin.jpg",
    note: "Shared, supervised, simple. Cabin life is half the camp."
  },
  {
    title: "Waterfront",
    image: "/Pictures/beach.jpg",
    note: "Lifeguards on duty. Life jackets required. Canoes after lunch."
  },
  {
    title: "Trails",
    image: "/Pictures/trails.jpg",
    note: "Quiet paths through pine. Daily reflection walks at sunrise."
  },
  {
    title: "Fire pit",
    image: "/Pictures/gFirePit.jpg",
    note: "Where the day ends. Stories, snacks, prayer, laughter."
  },
  {
    title: "Mess hall",
    image: "/Pictures/messHall.jpg",
    note: "Three meals together. Halal kitchen. No phones at the table."
  },
  {
    title: "Obstacle course",
    image: "/Pictures/obstacleCourse.jpg",
    note: "Built into the trees. Helmets on. Cabins compete on the last day."
  }
] as const;

export const packingList = [
  "Reusable water bottle",
  "Sleeping bag or blankets",
  "Pillow",
  "Long pants and shirts",
  "Raincoat or poncho",
  "Warm sweater",
  "Hat and towels",
  "Soap, toothbrush, toothpaste",
  "Flashlight",
  "Insect repellent and sunscreen",
  "Modest swimwear",
  "Closed-toe shoes for trails"
];

export const leaveAtHome = [
  "Phones and tablets",
  "Laptops, gaming devices",
  "Valuables and large amounts of cash",
  "Candy and outside food",
  "Weapons of any kind",
  "Fireworks, lighters, matches",
  "Laser pointers"
];

export const campCodeOfConduct = [
  "Stay with your group. Counsellors always know where you are.",
  "Follow counsellor direction without arguing — questions are welcome after.",
  "Respect the modest dress code on and off the water.",
  "Pray on time. We'll always tell you when.",
  "Speak kindly. Hands stay to yourself.",
  "Leave the woods and cabins better than you found them."
];

export const campWeekRhythm = [
  {
    day: "Sunday",
    title: "Arrive & settle",
    body: "Drop-off in the afternoon. Cabin assignments, tour of the grounds, opening fire after dinner."
  },
  {
    day: "Monday",
    title: "Find your feet",
    body: "Morning Quran, swim test, first canoe rotation, knot basics in the rec hall."
  },
  {
    day: "Tuesday",
    title: "Skills day",
    body: "Workshops rotate — fire-starting, archery, navigation, lashings. Service shift in the kitchen."
  },
  {
    day: "Wednesday",
    title: "Long trip",
    body: "Half-day trail hike to the lookout. Lunch on the rocks. Afternoon free for crafts or sports."
  },
  {
    day: "Thursday",
    title: "Camp-wide games",
    body: "Cabins compete on the obstacle course and the lake. Themed dinner. Quiet reflection circle."
  },
  {
    day: "Friday",
    title: "Jumu'ah & open lake",
    body: "Khutbah on the dock. Open swim and canoe. Talent night around the fire."
  },
  {
    day: "Saturday",
    title: "Pack & part",
    body: "Cabin clean-up, closing assembly, pickup at noon. We send a photo packet within a week."
  }
];
