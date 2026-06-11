/**
 * Tests for the /camp/register page logic and the registration redirect behaviour.
 *
 * The page has three code paths:
 *   1. Exactly one registerable camp → redirect to that camp's registerPath
 *   2. Multiple registerable camps → show CampRegisterSelector
 *   3. Zero registerable camps → show "Not open yet" + survey/newsletter CTAs
 *
 * We test the decision logic here, not the full React render.
 */

import { describe, it, expect } from "vitest";
import type { PublicCamp } from "@/lib/content/camps-public";

// ---------------------------------------------------------------------------
// Minimal stub for registerable camp shape
// ---------------------------------------------------------------------------
function makeCamp(slug: string, status: "open" | "full" = "open"): PublicCamp {
  return {
    id: slug,
    slug,
    title: `Camp ${slug}`,
    status,
    registrationStatus: status,
    startDate: "2026-08-06",
    endDate: "2026-08-09",
    heroImage: null,
    feePerCamper: 400,
    location: null,
    registrationClosesAt: null,
    registerPath: `/camp/${slug}/register`,
    registrationFormJotformId: "12345",
    waitlistFormJotformId: null
  };
}

// Decision logic replicated from app/camp/register/page.tsx
type PageDecision = "redirect" | "selector" | "not-open";
function decide(camps: PublicCamp[]): PageDecision {
  if (camps.length === 1) return "redirect";
  if (camps.length > 1) return "selector";
  return "not-open";
}

function redirectTarget(camps: PublicCamp[]): string | null {
  if (camps.length === 1) return camps[0].registerPath;
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("/camp/register page routing logic", () => {
  describe("zero registerable camps", () => {
    it("shows 'not open' page when no camps are registerable", () => {
      expect(decide([])).toBe("not-open");
    });
    it("does not redirect when empty", () => {
      expect(redirectTarget([])).toBeNull();
    });
  });

  describe("one registerable camp", () => {
    it("decides redirect", () => {
      expect(decide([makeCamp("main-camp-2026")])).toBe("redirect");
    });
    it("redirects to the correct registerPath", () => {
      const camps = [makeCamp("main-camp-2026")];
      expect(redirectTarget(camps)).toBe("/camp/main-camp-2026/register");
    });
    it("redirects even when status is full (waitlist)", () => {
      expect(decide([makeCamp("main-camp-2026", "full")])).toBe("redirect");
    });
  });

  describe("multiple registerable camps", () => {
    it("shows the selector for 2 camps", () => {
      expect(decide([makeCamp("camp-a"), makeCamp("camp-b")])).toBe("selector");
    });
    it("shows the selector for 3 camps", () => {
      expect(
        decide([makeCamp("camp-a"), makeCamp("camp-b"), makeCamp("camp-c")])
      ).toBe("selector");
    });
    it("does not redirect when multiple camps", () => {
      expect(redirectTarget([makeCamp("a"), makeCamp("b")])).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Tests for the survey + newsletter links that appear on the not-open page
// ---------------------------------------------------------------------------
describe("not-open page CTA links", () => {
  const SURVEY_URL = "https://www.jotform.com/form/261603186124047";
  const NEWSLETTER_URL = "http://eepurl.com/iXwvHk";

  it("survey URL is a valid https URL", () => {
    expect(SURVEY_URL).toMatch(/^https:\/\//);
  });

  it("newsletter URL starts with http", () => {
    expect(NEWSLETTER_URL).toMatch(/^https?:\/\//);
  });

  it("survey URL references JotForm", () => {
    expect(SURVEY_URL).toContain("jotform.com");
  });

  it("newsletter URL references Mailchimp (eepurl)", () => {
    expect(NEWSLETTER_URL).toContain("eepurl.com");
  });
});
