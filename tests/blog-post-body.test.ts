/**
 * Tests for BlogPostBody HTML detection.
 *
 * The component uses a regex to decide whether to render the body via
 * dangerouslySetInnerHTML (HTML mode) or the plain-text paragraph
 * renderer. This test suite exercises every edge case of that detection.
 */

import { describe, it, expect } from "vitest";

// Replicated from components/main/BlogPostBody.tsx
const HTML_TAG_PATTERN =
  /<(?:img|p|br|a|strong|em|b|i|ul|ol|li|h[1-6]|div|span|blockquote|hr|pre|code)\b/i;

function isHtml(body: string): boolean {
  return HTML_TAG_PATTERN.test(body);
}

describe("BlogPostBody HTML detection", () => {
  describe("plain-text bodies (should NOT trigger HTML mode)", () => {
    it("recognises plain text", () => {
      expect(isHtml("This is a plain text post.")).toBe(false);
    });
    it("does not trigger on double-newline paragraph separator", () => {
      expect(isHtml("First paragraph.\n\nSecond paragraph.")).toBe(false);
    });
    it("does not trigger on angle-bracket math (<3)", () => {
      expect(isHtml("We hiked <3 km today.")).toBe(false);
    });
    it("does not trigger on standalone less-than without tag name", () => {
      expect(isHtml("Score < 10")).toBe(false);
    });
    it("does not trigger on URLs with angle brackets in angle-quote style", () => {
      expect(isHtml("See <https://example.com> for details")).toBe(false);
    });
  });

  describe("HTML bodies (SHOULD trigger HTML mode)", () => {
    it("detects <img> tag", () => {
      expect(isHtml('<img src="https://example.com/photo.jpg" alt="" />')).toBe(true);
    });
    it("detects <p> tag", () => {
      expect(isHtml("<p>Hello world</p>")).toBe(true);
    });
    it("detects <strong> tag", () => {
      expect(isHtml("<strong>bold text</strong>")).toBe(true);
    });
    it("detects <em> tag", () => {
      expect(isHtml("<em>italic</em>")).toBe(true);
    });
    it("detects <br> tag", () => {
      expect(isHtml("Line one<br />Line two")).toBe(true);
    });
    it("detects <a> tag", () => {
      expect(isHtml('<a href="https://myo.camp">Link</a>')).toBe(true);
    });
    it("detects <ul>/<li> tags", () => {
      expect(isHtml("<ul><li>Item</li></ul>")).toBe(true);
    });
    it("detects mixed HTML in a longer body", () => {
      const mixed =
        "This is a paragraph.\n\nHere is a photo:\n<img src=\"/photo.jpg\" alt=\"\" />\n\nMore text.";
      expect(isHtml(mixed)).toBe(true);
    });
    it("detects uppercase tags", () => {
      expect(isHtml("<IMG SRC='x.jpg'>")).toBe(true);
    });
    it("detects self-closing tags", () => {
      expect(isHtml("<hr/>")).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Tests for renderParagraphText URL detection (plain-text mode only)
// ---------------------------------------------------------------------------
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function splitUrlParts(text: string): string[] {
  return text.split(URL_PATTERN);
}

describe("BlogPostBody URL linkification (plain text mode)", () => {
  it("splits text with a single URL into 3 parts", () => {
    const parts = splitUrlParts("Visit https://myo.camp for info");
    expect(parts).toHaveLength(3);
    expect(parts[1]).toBe("https://myo.camp");
  });
  it("detects http URLs", () => {
    const parts = splitUrlParts("Go to http://example.com now");
    expect(parts[1]).toBe("http://example.com");
  });
  it("returns single part for text without URLs", () => {
    const parts = splitUrlParts("No links here.");
    expect(parts).toHaveLength(1);
  });
  it("detects two URLs in one paragraph", () => {
    const parts = splitUrlParts("See https://a.com and https://b.com");
    const urls = parts.filter((_, i) => i % 2 === 1);
    expect(urls).toEqual(["https://a.com", "https://b.com"]);
  });
  it("captures the JotForm survey URL correctly", () => {
    const text = "Fill out https://www.jotform.com/form/261603186124047 today";
    const parts = splitUrlParts(text);
    expect(parts[1]).toBe("https://www.jotform.com/form/261603186124047");
  });
});
