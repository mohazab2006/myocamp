import type { SiteSettings } from "../types";

export const siteSettings: SiteSettings = {
  email: "myoadmin@gmail.com",
  donateUrl: "https://www.paypal.com/donate/?hosted_button_id=PVVD32WHTA9KE",
  volunteerUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSdXXKBLPvd0A6X-D0ildNXdvqEymLY-KmGxHEz_CvfWshCeWg/viewform?usp=send_form",
  newsletterUrl: "http://eepurl.com/iXwvHk",
  socials: [
    {
      platform: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/muslimyouthofottawa"
    },
    {
      platform: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/myocamp/"
    },
    {
      platform: "email",
      label: "Email",
      url: "mailto:myoadmin@gmail.com"
    },
    {
      platform: "photos",
      label: "Photo gallery",
      url: "https://www.facebook.com/muslimyouthofottawa/photos_stream"
    },
    {
      platform: "vimeo",
      label: "Vimeo",
      url: "https://vimeo.com/72094611"
    },
    {
      platform: "camp",
      label: "Camp Smitty",
      url: "https://www.campsmitty.com/"
    }
  ]
};

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export const orgMission =
  "Muslim Youth of Ottawa builds a positive Islamic environment where young people learn, pray, play, and grow into a confident Canadian Muslim identity. We run hikes, halaqas, service days, and the camp — all volunteer-led, all year long.";

export const orgFoundedLine = "Volunteer-run since the 1980s.";
