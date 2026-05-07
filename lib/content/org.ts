import type { SiteSettings } from "../types";

export async function getSiteSettings(): Promise<SiteSettings> {
  return {
    email: "myoadmin@gmail.com",
    donateUrl:
      "https://www.paypal.com/donate/?hosted_button_id=PVVD32WHTA9KE",
    volunteerUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSdXXKBLPvd0A6X-D0ildNXdvqEymLY-KmGxHEz_CvfWshCeWg/viewform?usp=send_form",
    socials: [
      { label: "Email", url: "mailto:myoadmin@gmail.com" },
      { label: "Camp Smitty", url: "https://www.campsmitty.com/" }
    ]
  };
}

export const orgMission =
  "Muslim Youth of Ottawa builds a positive Islamic environment where young people learn, pray, play, and grow into a confident Canadian Muslim identity. We run hikes, halaqas, service days, and the camp — all volunteer-led, all year long.";

export const orgFoundedLine = "Volunteer-run since the 1980s.";
