import type { OrgProgram } from "../types";

const seedPrograms: OrgProgram[] = [
  {
    slug: "weekly-youth-halaqa",
    title: "Weekly Youth Halaqa",
    type: "weekly",
    cadence: "Every Friday, 7:00 pm",
    audience: ["youth"],
    blurb:
      "A weekly circle for youth ages 12–18: Quran, reflection, open discussion, and tea after. Drop-in welcome.",
    heroImage: "/Pictures/library.jpg",
    active: true,
    startedAt: "2024-09-06"
  },
  {
    slug: "lit-mentorship",
    title: "LIT Mentorship Cohort",
    type: "cohort",
    cadence: "Eight Saturdays, fall and winter",
    audience: ["leaders"],
    blurb:
      "An eight-week mentorship for ages 17–19 that prepares Leaders in Training to staff the camp. Leadership, first aid, group dynamics.",
    heroImage: "/Pictures/assembly.jpg",
    active: true,
    startedAt: "2025-01-11"
  },
  {
    slug: "knot-fire-bow-skills",
    title: "Knot, Fire & Bow Skills",
    type: "drop-in",
    cadence: "Third Saturday each month",
    audience: ["youth", "families"],
    blurb:
      "Rotating skills clinic: rope-work and lashings, fire-craft from char to coal, and beginner archery on the back range.",
    heroImage: "/Pictures/bFirePit.jpg",
    active: true,
    startedAt: "2025-03-15"
  },
  {
    slug: "sisters-fitness-circle",
    title: "Sisters' Fitness Circle",
    type: "weekly",
    cadence: "Tuesday evenings",
    audience: ["youth", "leaders"],
    blurb:
      "Members-only fitness sessions for sisters — strength, cardio, and a short halaqa to close.",
    heroImage: "/Pictures/sports.jpg",
    active: true,
    startedAt: "2024-10-01"
  },
  {
    slug: "brothers-basketball-2024",
    title: "Brothers' Basketball League",
    type: "weekly",
    cadence: "Wednesdays — concluded May 2024",
    audience: ["youth"],
    blurb:
      "Eight-week pickup league at the local rec centre. Concluded May 2024 — looking for a new gym before relaunch.",
    heroImage: "/Pictures/sports.jpg",
    active: false,
    startedAt: "2024-03-06"
  }
];

export async function getPrograms(): Promise<OrgProgram[]> {
  return seedPrograms;
}

export async function getProgram(slug: string): Promise<OrgProgram | null> {
  return seedPrograms.find((p) => p.slug === slug) ?? null;
}
