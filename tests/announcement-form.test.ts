/**
 * Tests for announcement link parsing in saveAnnouncementAction.
 *
 * The action receives a linksJson hidden-input value and parses it into
 * an array of AnnouncementLink objects. This covers all edge cases:
 * invalid JSON, missing fields, URL trimming, first-link primary flag.
 */

import { describe, it, expect } from "vitest";
import type { AnnouncementLink } from "@/lib/types";

// Replicated from app/admin/actions.ts saveAnnouncementAction
function parseAnnouncementLinks(raw: string): AnnouncementLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.href === "string" && l.href.trim())
      .map((l, i) => ({
        href: String(l.href).trim(),
        label: String(l.label ?? "").trim() || "Learn more",
        primary: i === 0
      }));
  } catch {
    return [];
  }
}

describe("parseAnnouncementLinks()", () => {
  it("returns empty array for empty string", () => {
    expect(parseAnnouncementLinks("")).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseAnnouncementLinks("not valid")).toEqual([]);
  });

  it("returns empty array for JSON object (not array)", () => {
    expect(parseAnnouncementLinks('{"href":"x"}')).toEqual([]);
  });

  it("parses a single link", () => {
    const json = JSON.stringify([{ href: "https://myo.camp", label: "Visit site" }]);
    const result = parseAnnouncementLinks(json);
    expect(result).toHaveLength(1);
    expect(result[0].href).toBe("https://myo.camp");
    expect(result[0].label).toBe("Visit site");
  });

  it("marks the first link as primary", () => {
    const json = JSON.stringify([
      { href: "https://a.com", label: "A" },
      { href: "https://b.com", label: "B" }
    ]);
    const result = parseAnnouncementLinks(json);
    expect(result[0].primary).toBe(true);
    expect(result[1].primary).toBe(false);
  });

  it("filters out links with empty href", () => {
    const json = JSON.stringify([
      { href: "", label: "No href" },
      { href: "https://good.com", label: "Good" }
    ]);
    expect(parseAnnouncementLinks(json)).toHaveLength(1);
  });

  it("filters out links with whitespace-only href", () => {
    const json = JSON.stringify([{ href: "   ", label: "Blank" }]);
    expect(parseAnnouncementLinks(json)).toHaveLength(0);
  });

  it("trims whitespace from href", () => {
    const json = JSON.stringify([{ href: "  https://myo.camp  ", label: "Visit" }]);
    expect(parseAnnouncementLinks(json)[0].href).toBe("https://myo.camp");
  });

  it("defaults missing label to 'Learn more'", () => {
    const json = JSON.stringify([{ href: "https://myo.camp" }]);
    expect(parseAnnouncementLinks(json)[0].label).toBe("Learn more");
  });

  it("defaults blank label to 'Learn more'", () => {
    const json = JSON.stringify([{ href: "https://myo.camp", label: "" }]);
    expect(parseAnnouncementLinks(json)[0].label).toBe("Learn more");
  });

  it("handles the real survey + newsletter links", () => {
    const json = JSON.stringify([
      { href: "https://www.jotform.com/form/261603186124047", label: "Fill out the survey" },
      { href: "http://eepurl.com/iXwvHk", label: "Join the newsletter" },
      { href: "/blog", label: "See announcements" }
    ]);
    const result = parseAnnouncementLinks(json);
    expect(result).toHaveLength(3);
    expect(result[0].href).toContain("jotform.com");
    expect(result[1].href).toContain("eepurl.com");
    expect(result[2].href).toBe("/blog");
  });

  it("returns empty array for JSON null", () => {
    expect(parseAnnouncementLinks("null")).toEqual([]);
  });
});
