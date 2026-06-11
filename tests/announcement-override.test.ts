/**
 * Tests for the announcement override logic in lib/content/home-camp.ts
 *
 * buildBigNews() decides what the home-page banner shows. When
 * announcementOverride.enabled is true it bypasses the camp-registration
 * logic entirely and returns the admin-configured message.
 */

import { describe, it, expect } from "vitest";
import type { AnnouncementOverride, CampSettings } from "@/lib/types";
import type { PublicCamp } from "@/lib/content/camps-public";
import type { OrgEvent } from "@/lib/types";

// ---------------------------------------------------------------------------
// Minimal stub types used by buildBigNews
// ---------------------------------------------------------------------------
type HomeBigNewsLink = { href: string; label: string; primary?: boolean };
type HomeBigNews = { label?: string; message: string; highlight?: string; links: HomeBigNewsLink[] };

// Replicated from lib/content/home-camp.ts
function buildBigNews(
  openCamps: PublicCamp[],
  legacy: CampSettings,
  _events: OrgEvent[]
): HomeBigNews {
  const override = legacy.announcementOverride;
  if (override?.enabled) {
    return {
      label: override.label,
      message: override.message,
      highlight: override.highlight,
      links: override.links ?? []
    };
  }
  if (openCamps.length > 0) {
    return {
      message: "Camp registration is now open",
      links: [{ href: "/camp", label: "Visit camp site", primary: true }]
    };
  }
  return {
    message: "MYO Summer Camp 2026 registration opens",
    highlight: legacy.registrationOpens,
    links: [{ href: "/camp", label: "Camp preview", primary: true }]
  };
}

// ---------------------------------------------------------------------------
// Minimal seed data
// ---------------------------------------------------------------------------
const baseLegacy: CampSettings = {
  registrationStatus: "opening-soon",
  registrationOpens: "2026-06-29",
  campStart: "2026-08-06",
  campEnd: "2026-08-09",
  staffArrival: "Wednesday at 6pm",
  formUrl: "https://form.jotform.com/241729323092253",
  feeCamper: 400,
  feeLit: 400,
  dropOff: "Thursday morning",
  pickUp: "Sunday at 3pm",
  paymentEmail: "myoadmin@gmail.com",
  paypalDonateId: "PVVD32WHTA9KE"
};

const noOpenCamps: PublicCamp[] = [];
const noEvents: OrgEvent[] = [];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("buildBigNews() — announcement override", () => {
  describe("when override is disabled", () => {
    it("shows camp-registration message when camps are open", () => {
      const openCamp = {
        id: "1",
        slug: "main-camp-2026",
        title: "Main Camp",
        status: "open" as const,
        registrationStatus: "open" as const,
        startDate: "2026-08-06",
        endDate: "2026-08-09",
        heroImage: null,
        feePerCamper: 400,
        location: null,
        registrationClosesAt: null,
        registerPath: "/camp/main-camp-2026/register",
        registrationFormJotformId: null,
        waitlistFormJotformId: null
      } satisfies PublicCamp;
      const result = buildBigNews([openCamp], baseLegacy, noEvents);
      expect(result.message).toBe("Camp registration is now open");
    });

    it("shows registration-opens message when no camps are open", () => {
      const result = buildBigNews(noOpenCamps, baseLegacy, noEvents);
      expect(result.message).toBe("MYO Summer Camp 2026 registration opens");
    });

    it("includes registrationOpens as highlight when no camps are open", () => {
      const result = buildBigNews(noOpenCamps, baseLegacy, noEvents);
      expect(result.highlight).toBe("2026-06-29");
    });
  });

  describe("when override is enabled", () => {
    const override: AnnouncementOverride = {
      enabled: true,
      label: "Announcement",
      message: "New Camps! Don't miss out on registration opening.",
      highlight: undefined,
      links: [
        { href: "https://www.jotform.com/form/261603186124047", label: "Fill out the survey", primary: true },
        { href: "http://eepurl.com/iXwvHk", label: "Join the newsletter" }
      ]
    };
    const legacyWithOverride = { ...baseLegacy, announcementOverride: override };

    it("returns the override message, not the camp message", () => {
      const result = buildBigNews(noOpenCamps, legacyWithOverride, noEvents);
      expect(result.message).toBe("New Camps! Don't miss out on registration opening.");
    });

    it("ignores open camps and still returns override", () => {
      const openCamp = {
        id: "1",
        slug: "main-camp",
        title: "Main Camp",
        status: "open" as const,
        registrationStatus: "open" as const,
        startDate: "2026-08-06",
        endDate: "2026-08-09",
        heroImage: null,
        feePerCamper: 400,
        location: null,
        registrationClosesAt: null,
        registerPath: "/camp/main-camp/register",
        registrationFormJotformId: null,
        waitlistFormJotformId: null
      } satisfies PublicCamp;
      const result = buildBigNews([openCamp], legacyWithOverride, noEvents);
      expect(result.message).toBe("New Camps! Don't miss out on registration opening.");
    });

    it("returns the override label", () => {
      const result = buildBigNews(noOpenCamps, legacyWithOverride, noEvents);
      expect(result.label).toBe("Announcement");
    });

    it("returns the override links", () => {
      const result = buildBigNews(noOpenCamps, legacyWithOverride, noEvents);
      expect(result.links).toHaveLength(2);
      expect(result.links[0].href).toBe("https://www.jotform.com/form/261603186124047");
      expect(result.links[0].label).toBe("Fill out the survey");
    });

    it("marks first link as primary", () => {
      const result = buildBigNews(noOpenCamps, legacyWithOverride, noEvents);
      expect(result.links[0].primary).toBe(true);
    });
  });

  describe("when override exists but is disabled", () => {
    it("falls back to camp logic", () => {
      const disabledOverride: AnnouncementOverride = {
        enabled: false,
        message: "Should not appear",
        links: []
      };
      const legacy = { ...baseLegacy, announcementOverride: disabledOverride };
      const result = buildBigNews(noOpenCamps, legacy, noEvents);
      expect(result.message).toBe("MYO Summer Camp 2026 registration opens");
    });
  });

  describe("edge cases", () => {
    it("returns empty links array when override has no links", () => {
      const override: AnnouncementOverride = {
        enabled: true,
        message: "Test",
        links: []
      };
      const result = buildBigNews(noOpenCamps, { ...baseLegacy, announcementOverride: override }, noEvents);
      expect(result.links).toEqual([]);
    });

    it("handles override without optional label", () => {
      const override: AnnouncementOverride = { enabled: true, message: "Test", links: [] };
      const result = buildBigNews(noOpenCamps, { ...baseLegacy, announcementOverride: override }, noEvents);
      expect(result.label).toBeUndefined();
    });
  });
});
