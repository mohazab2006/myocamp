import type { CampSettings } from "../types";
import { fetchSupabaseCampSettings } from "../supabase/content";

export const campMapEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d8203.837028744429!2d-77.04916149272421!3d45.557084590512!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sca!4v1687106356229!5m2!1sen!2sca";

const campSeed: CampSettings = {
  registrationStatus: "opening-soon",
  registrationOpens: "2026-06-29",
  registrationDeadline: "2026-07-24",
  litStart: "2026-07-23",
  litEnd: "2026-07-26",
  campStart: "2026-08-06",
  campEnd: "2026-08-09",
  staffArrival: "Wednesday at 6pm",
  formUrl: "https://form.jotform.com/241729323092253",
  feeCamper: 400,
  feeLit: 400,
  dropOff: "Thursday morning",
  pickUp: "Sunday at 3pm",
  paymentEmail: "myoadmin@gmail.com",
  paypalDonateId: "PVVD32WHTA9KE",
  announcementOverride: {
    enabled: true,
    label: "Announcement",
    message:
      "New Camps! Don't miss out on registration opening. Fill out the pre-registration survey and sign up for the newsletter.",
    links: [
      {
        href: "https://www.jotform.com/form/261603186124047",
        label: "Fill out the survey",
        primary: true
      },
      { href: "http://eepurl.com/iXwvHk", label: "Join the newsletter" },
      { href: "/blog", label: "See announcements" }
    ]
  }
};

export async function getCampSettings(): Promise<CampSettings> {
  const override = await fetchSupabaseCampSettings();
  if (!override) return campSeed;
  return { ...campSeed, ...override };
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

export const campStorySnapshots = [
  {
    src: "/Pictures/welcomeCabin.jpg",
    alt: "Welcome cabin at Camp Smitty",
    caption: "Welcome cabin",
    note: "first look on arrival day"
  },
  {
    src: "/Pictures/verycoolcampfire.jpg",
    alt: "Campers around the fire pit at dusk",
    caption: "Fire circle",
    note: "where the day actually ends"
  },
  {
    src: "/Pictures/canoes2.jpg",
    alt: "Canoes lined up at the waterfront",
    caption: "Waterfront",
    note: "life jackets before lunch"
  },
  {
    src: "/Pictures/lit.JPG",
    alt: "LIT crew in thobes on the trail at camp",
    caption: "LIT crew",
    note: "older youth learning to lead"
  }
] as const;

export const campStoryChapters = [
  {
    eyebrow: "who runs it",
    title: "Volunteers who come back every August.",
    paragraphs: [
      "Camp is run by counsellors, lifeguards, cooks, drivers, medics, and the long list of parents who say yes when we ask. There is no professional camp company and no hired-out kitchen.",
      "Every meal, every fire, every cabin check is done by people who love this — many of them former campers who aged out and came back as staff."
    ],
    images: [
      {
        src: "/Pictures/staff.png",
        alt: "MYO Camp volunteer staff gathered around the table",
        caption: "The staff table",
        note: "the people who show up every August"
      },
      {
        src: "/Pictures/kitchenstaff.png",
        alt: "MYO Camp kitchen volunteers in the camp kitchen",
        caption: "Kitchen crew",
        note: "halal meals, three times a day"
      }
    ]
  },
  {
    eyebrow: "where we gather",
    title: "Camp Smitty knows our rhythm.",
    paragraphs: [
      "We rent Camp Smitty in Eganville for the week. They have hosted us for decades, know our prayer times, and keep our lifejacket inventory labeled in their own handwriting.",
      "The site is a working camp the rest of the year — cabins, kitchen, lake, woods, and trails. For our session we take the whole place and make it ours."
    ],
    images: [
      {
        src: "/Pictures/story1.png",
        alt: "Canoes spread across Mink Lake at Camp Smitty",
        caption: "Out on Mink Lake",
        note: "afternoon canoe rotation"
      },
      {
        src: "/Pictures/trails.jpg",
        alt: "Pine forest trail through camp",
        caption: "Morning trails",
        note: "optional sunrise walk"
      }
    ]
  },
  {
    eyebrow: "what we teach",
    title: "Hard skills, taught for real life.",
    paragraphs: [
      "We pick activities that build something — knots, fire-craft, navigation, archery, lashings — because at fourteen, learning that you can do hard things on your own is the actual lesson.",
      "Faith is the spine of the week, but it is not the schedule. It is how the schedule is run: salah on time, modest dress on the water, kindness in the cabin."
    ],
    images: [
      {
        src: "/Pictures/story2.png",
        alt: "Campers learning a skill together at MYO Camp",
        caption: "Workshops in rotation",
        note: "knots, fire, archery, navigation"
      },
      {
        src: "/Pictures/story3.png",
        alt: "Camp moment captured during the week at MYO Camp",
        caption: "Practice by day",
        note: "fire-circle by dusk"
      }
    ]
  }
] as const;

export const campStoryMoments = [
  {
    src: "/Pictures/kidswiththobes.JPG",
    alt: "Campers in modest dress together outdoors",
    caption: "Modest dress, real friendship",
    note: "the week is lived together, not performed for a feed"
  },
  {
    src: "/Pictures/insideBCabin.jpg",
    alt: "Inside a boys cabin bunk room",
    caption: "Cabin life",
    note: "mess duty, lights out, inside jokes"
  },
  {
    src: "/Pictures/beach.jpg",
    alt: "Sandy beach on the lake",
    caption: "Swim test day",
    note: "lifeguards on duty all afternoon"
  },
  {
    src: "/Pictures/recHall.jpg",
    alt: "Recreation hall activity space",
    caption: "Rec hall",
    note: "knot drills and rainy-day games"
  },
  {
    src: "/Pictures/treeHouse.jpg",
    alt: "Tree house structure in the woods",
    caption: "Tree house",
    note: "a landmark every new camper finds"
  },
  {
    src: "/Pictures/basketball.jpg",
    alt: "Campers playing basketball outdoors",
    caption: "Court behind the cabins",
    note: "pickup games between rotations"
  }
] as const;

export const campDriveSteps = [
  {
    title: "Head west from Ottawa",
    detail: "Take Highway 417 toward Arnprior and Pembroke. Plan about two hours from downtown, longer with a cabin-group stop."
  },
  {
    title: "Stay on Hwy 17 past Eganville",
    detail: "The last stretch is quieter road past Lac des Loups. Cell signal fades before you reach the turnoff — that is normal."
  },
  {
    title: "Turn onto Mink Lake Road",
    detail: "Camp Smitty is at 98 Mink Lake Road. Follow camp signage to the main parking area for drop-off."
  },
  {
    title: "Check in at the welcome cabin",
    detail: "Staff greet families at the welcome cabin, confirm cabin assignment, and point you to gear drop-off."
  }
] as const;

export const campArrivalNotes = [
  "Pack the duffel you can carry — there is a short walk from parking to cabins.",
  "Label everything with your camper's name; lost-and-found fills fast.",
  "Bring any medication in original packaging to the medic table at check-in.",
  "Parents leave after cabin assignment unless staff ask you to stay for a quick hello."
] as const;

export const campWeekRhythm = [
  {
    day: "Thursday",
    title: "Arrive & settle",
    body: "Staff arrive Wednesday evening. Campers Thursday morning. Cabin assignments, tour of the grounds, opening fire after dinner."
  },
  {
    day: "Friday",
    title: "Find your feet",
    body:
      "Morning Quran, swim test, first canoe rotation, knot basics in the rec hall. Jumu'ah khutbah on Friday."
  },
  {
    day: "Saturday",
    title: "Skills & camp-wide games",
    body: "Workshops rotate — fire-starting, archery, navigation, lashings. Cabins compete on the obstacle course and the lake."
  },
  {
    day: "Sunday",
    title: "Pack out & closing",
    body: "Open swim and canoe. Cabin clean-up, closing assembly, pickup at 3pm."
  }
];
