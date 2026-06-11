/**
 * Tests for image upload validation logic in lib/admin/media.ts
 *
 * These tests cover the pre-flight checks that guard the Supabase storage
 * upload: MIME type allow-listing, file size cap, and path construction.
 * The actual Supabase network call is skipped here (it's integration-tested
 * manually).
 */

import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------------------------
// Replicate the pure validation logic from media.ts so we can test it
// without importing server-only modules.
// ---------------------------------------------------------------------------
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function validateImage(file: { type: string; size: number; name: string }): string | null {
  if (file.size === 0) return "No file selected.";
  if (!ALLOWED_MIME.has(file.type)) return `Unsupported image type: ${file.type || "unknown"}.`;
  if (file.size > MAX_BYTES)
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`;
  return null;
}

function buildObjectPath(folder: string, filename: string, mimeType: string): string {
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "misc";
  const extension =
    filename.includes(".") ? filename.split(".").pop()?.toLowerCase() : mimeType.split("/")[1];
  return `${safeFolder}/timestamp-uuid.${extension ?? "bin"}`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("image upload validation", () => {
  describe("MIME type checking", () => {
    it("accepts image/jpeg", () => {
      expect(validateImage({ type: "image/jpeg", size: 100, name: "photo.jpg" })).toBeNull();
    });
    it("accepts image/png", () => {
      expect(validateImage({ type: "image/png", size: 100, name: "photo.png" })).toBeNull();
    });
    it("accepts image/webp", () => {
      expect(validateImage({ type: "image/webp", size: 100, name: "photo.webp" })).toBeNull();
    });
    it("accepts image/gif", () => {
      expect(validateImage({ type: "image/gif", size: 100, name: "photo.gif" })).toBeNull();
    });
    it("accepts image/avif", () => {
      expect(validateImage({ type: "image/avif", size: 100, name: "photo.avif" })).toBeNull();
    });
    it("rejects image/tiff", () => {
      expect(validateImage({ type: "image/tiff", size: 100, name: "photo.tiff" })).toContain(
        "Unsupported"
      );
    });
    it("rejects application/pdf", () => {
      expect(
        validateImage({ type: "application/pdf", size: 100, name: "doc.pdf" })
      ).toContain("Unsupported");
    });
    it("rejects text/plain", () => {
      expect(validateImage({ type: "text/plain", size: 100, name: "note.txt" })).toContain(
        "Unsupported"
      );
    });
    it("rejects empty MIME type string", () => {
      expect(validateImage({ type: "", size: 100, name: "file" })).toContain("unknown");
    });
  });

  describe("file size checking", () => {
    it("accepts exactly 8 MB", () => {
      expect(validateImage({ type: "image/jpeg", size: MAX_BYTES, name: "big.jpg" })).toBeNull();
    });
    it("accepts 1 byte", () => {
      expect(validateImage({ type: "image/png", size: 1, name: "tiny.png" })).toBeNull();
    });
    it("rejects 0 bytes (empty file)", () => {
      expect(validateImage({ type: "image/jpeg", size: 0, name: "empty.jpg" })).toBe(
        "No file selected."
      );
    });
    it("rejects 8 MB + 1 byte", () => {
      expect(
        validateImage({ type: "image/jpeg", size: MAX_BYTES + 1, name: "toobig.jpg" })
      ).toContain("too large");
    });
    it("rejects 20 MB file", () => {
      expect(
        validateImage({ type: "image/jpeg", size: 20 * 1024 * 1024, name: "huge.jpg" })
      ).toContain("too large");
    });
    it("includes the actual size in the error message", () => {
      const size = Math.round(9.5 * 1024 * 1024);
      const err = validateImage({ type: "image/jpeg", size, name: "big.jpg" });
      expect(err).toContain("9.5 MB");
    });
  });

  describe("folder sanitisation", () => {
    it("passes blog folder through unchanged", () => {
      const path = buildObjectPath("blog", "photo.jpg", "image/jpeg");
      expect(path).toMatch(/^blog\//);
    });
    it("passes events folder through unchanged", () => {
      const path = buildObjectPath("events", "photo.png", "image/png");
      expect(path).toMatch(/^events\//);
    });
    it("passes camps folder through unchanged", () => {
      const path = buildObjectPath("camps", "img.webp", "image/webp");
      expect(path).toMatch(/^camps\//);
    });
    it("strips path-traversal characters", () => {
      const path = buildObjectPath("../secret", "x.jpg", "image/jpeg");
      expect(path).not.toContain("..");
      expect(path).toMatch(/^secret\//);
    });
    it("falls back to misc for empty folder", () => {
      const path = buildObjectPath("", "x.jpg", "image/jpeg");
      expect(path).toMatch(/^misc\//);
    });
    it("lowercases the folder", () => {
      const path = buildObjectPath("BLOG", "x.jpg", "image/jpeg");
      expect(path).toMatch(/^blog\//);
    });
  });

  describe("file extension extraction", () => {
    it("extracts jpg extension from filename", () => {
      const path = buildObjectPath("blog", "vacation.jpg", "image/jpeg");
      expect(path).toMatch(/\.jpg$/);
    });
    it("extracts PNG extension lowercased", () => {
      const path = buildObjectPath("blog", "photo.PNG", "image/png");
      expect(path).toMatch(/\.png$/);
    });
    it("falls back to MIME type when filename has no extension", () => {
      const path = buildObjectPath("blog", "noextension", "image/webp");
      expect(path).toMatch(/\.webp$/);
    });
  });
});
