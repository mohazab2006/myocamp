/**
 * Tests for blog link parsing and blog-post utilities.
 *
 * Covers the linksJson parsing that happens in saveBlogPostAction, the
 * compact() helper that strips empty/null fields, and the slugify() helper.
 * All logic is replicated here because the actions.ts module uses
 * "use server" which can't be imported in a vitest environment.
 */

import { describe, it, expect } from "vitest";
import type { BlogLink } from "@/lib/types";

// ---------------------------------------------------------------------------
// Replicated helpers from app/admin/actions.ts
// ---------------------------------------------------------------------------
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function compact<T extends object>(record: T): T {
  return Object.fromEntries(
    Object.entries(record as Record<string, unknown>).filter(([, entry]) => {
      if (Array.isArray(entry)) return entry.length > 0;
      return entry !== "" && entry !== undefined && entry !== null;
    })
  ) as T;
}

function parseLinksJson(raw: string): BlogLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.url === "string" && l.url.trim())
      .map((l) => ({
        url: String(l.url).trim(),
        label: String(l.label ?? "").trim() || "Learn more"
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tests: slugify
// ---------------------------------------------------------------------------
describe("slugify()", () => {
  it("lowercases input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("replaces spaces with dashes", () => {
    expect(slugify("camp hike 2026")).toBe("camp-hike-2026");
  });
  it("collapses multiple spaces/symbols into one dash", () => {
    expect(slugify("clean  the  capitol")).toBe("clean-the-capitol");
  });
  it("strips leading and trailing dashes", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });
  it("preserves numbers", () => {
    expect(slugify("hike 2026-07-01")).toBe("hike-2026-07-01");
  });
  it("strips special characters", () => {
    expect(slugify("It's a wonderful life!")).toBe("it-s-a-wonderful-life");
  });
  it("truncates at 80 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long)).toHaveLength(80);
  });
  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Tests: compact()
// ---------------------------------------------------------------------------
describe("compact()", () => {
  it("removes empty strings", () => {
    const result = compact({ title: "Hello", body: "" });
    expect(result).toEqual({ title: "Hello" });
  });
  it("removes null values", () => {
    const result = compact({ title: "Hello", heroImage: null });
    expect(result).toEqual({ title: "Hello" });
  });
  it("removes undefined values", () => {
    const result = compact({ title: "Hello", heroImage: undefined });
    expect(result).toEqual({ title: "Hello" });
  });
  it("keeps non-empty strings", () => {
    const result = compact({ title: "Hello", body: "World" });
    expect(result).toEqual({ title: "Hello", body: "World" });
  });
  it("removes empty arrays", () => {
    const result = compact({ title: "Hello", links: [] });
    expect(result).toEqual({ title: "Hello" });
  });
  it("keeps non-empty arrays", () => {
    const links = [{ url: "https://example.com", label: "Click" }];
    const result = compact({ title: "Hello", links });
    expect(result).toEqual({ title: "Hello", links });
  });
  it("keeps 0 and false (falsy but valid)", () => {
    const result = compact({ count: 0, archived: false });
    // 0 and false are not in the filter exclusion list
    expect("count" in result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: parseLinksJson()
// ---------------------------------------------------------------------------
describe("parseLinksJson()", () => {
  it("returns empty array for empty string", () => {
    expect(parseLinksJson("")).toEqual([]);
  });
  it("returns empty array for invalid JSON", () => {
    expect(parseLinksJson("{not json}")).toEqual([]);
  });
  it("returns empty array for non-array JSON", () => {
    expect(parseLinksJson('{"url":"x"}')).toEqual([]);
  });
  it("parses a single valid link", () => {
    const json = JSON.stringify([{ url: "https://example.com", label: "Go" }]);
    expect(parseLinksJson(json)).toEqual([{ url: "https://example.com", label: "Go" }]);
  });
  it("parses multiple links", () => {
    const json = JSON.stringify([
      { url: "https://a.com", label: "A" },
      { url: "https://b.com", label: "B" }
    ]);
    expect(parseLinksJson(json)).toHaveLength(2);
  });
  it("filters out entries with empty URL", () => {
    const json = JSON.stringify([
      { url: "", label: "No URL" },
      { url: "https://good.com", label: "Good" }
    ]);
    expect(parseLinksJson(json)).toHaveLength(1);
    expect(parseLinksJson(json)[0].url).toBe("https://good.com");
  });
  it("filters out entries where URL is whitespace only", () => {
    const json = JSON.stringify([{ url: "   ", label: "Blank" }]);
    expect(parseLinksJson(json)).toHaveLength(0);
  });
  it("defaults missing label to 'Learn more'", () => {
    const json = JSON.stringify([{ url: "https://example.com" }]);
    expect(parseLinksJson(json)[0].label).toBe("Learn more");
  });
  it("defaults empty label to 'Learn more'", () => {
    const json = JSON.stringify([{ url: "https://example.com", label: "" }]);
    expect(parseLinksJson(json)[0].label).toBe("Learn more");
  });
  it("trims whitespace from URL", () => {
    const json = JSON.stringify([{ url: "  https://example.com  ", label: "Click" }]);
    expect(parseLinksJson(json)[0].url).toBe("https://example.com");
  });
  it("correctly handles JotForm survey URL", () => {
    const surveyUrl = "https://www.jotform.com/form/261603186124047";
    const json = JSON.stringify([{ url: surveyUrl, label: "Fill out the survey" }]);
    const result = parseLinksJson(json);
    expect(result[0].url).toBe(surveyUrl);
    expect(result[0].label).toBe("Fill out the survey");
  });
});
