export type AudienceTag = "youth" | "parents" | "families" | "leaders" | "all";
export type EventType =
  | "hike"
  | "campfire"
  | "fundraiser"
  | "social"
  | "service"
  | "camp"
  | "workshop";
export type ProgramType = "weekly" | "cohort" | "drop-in" | "mentorship";

export interface OrgEvent {
  slug: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location: string;
  audience: AudienceTag[];
  blurb: string;
  body?: string;
  heroImage?: string;
  registerUrl?: string;
  registerOpens?: string;
  registerCloses?: string;
  cost?: string;
  archived?: boolean;
}

export interface OrgProgram {
  slug: string;
  title: string;
  type: ProgramType;
  cadence: string;
  audience: AudienceTag[];
  blurb: string;
  body?: string;
  heroImage?: string;
  signupUrl?: string;
  active: boolean;
  startedAt?: string;
}

export interface SiteSettings {
  email: string;
  donateUrl: string;
  volunteerUrl: string;
  socials: { label: string; url: string }[];
}

export interface CampSettings {
  registrationStatus: "open" | "full" | "closed" | "opening-soon";
  registrationOpens?: string;
  registrationDeadline?: string;
  campStart: string;
  campEnd: string;
  formUrl: string;
  feeCamper: number;
  feeLit: number;
  dropOff: string;
  pickUp: string;
  paymentEmail: string;
  paypalDonateId: string;
}
