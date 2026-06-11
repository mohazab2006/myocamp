/**
 * Tests for the client-side pre-flight validation in ImageUploader.
 *
 * The component validates type and size before sending FormData to the
 * server action. This ensures bad files are rejected early without a
 * round-trip to Supabase.
 */

import { describe, it, expect } from "vitest";

// Replicated from components/admin/image-uploader.tsx
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

function clientValidate(file: { type: string; size: number }): string | null {
  if (!file.type.startsWith("image/")) return "That isn't an image file.";
  if (file.size > MAX_BYTES)
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`;
  return null;
}

describe("ImageUploader client-side validation", () => {
  describe("MIME type check (startsWith 'image/')", () => {
    it("accepts all supported image types", () => {
      for (const type of ACCEPT_TYPES) {
        expect(clientValidate({ type, size: 100 })).toBeNull();
      }
    });
    it("rejects PDF", () => {
      expect(clientValidate({ type: "application/pdf", size: 100 })).toBe(
        "That isn't an image file."
      );
    });
    it("rejects text/plain", () => {
      expect(clientValidate({ type: "text/plain", size: 100 })).toBe(
        "That isn't an image file."
      );
    });
    it("rejects empty string", () => {
      expect(clientValidate({ type: "", size: 100 })).toBe("That isn't an image file.");
    });
    it("rejects video/mp4", () => {
      expect(clientValidate({ type: "video/mp4", size: 100 })).toBe(
        "That isn't an image file."
      );
    });
  });

  describe("file size check", () => {
    it("accepts exactly 8 MB", () => {
      expect(clientValidate({ type: "image/jpeg", size: MAX_BYTES })).toBeNull();
    });
    it("rejects 8 MB + 1 byte", () => {
      const err = clientValidate({ type: "image/jpeg", size: MAX_BYTES + 1 });
      expect(err).not.toBeNull();
      expect(err).toContain("Max 8 MB");
    });
    it("error message shows the actual MB value", () => {
      const size = Math.round(9.2 * 1024 * 1024);
      const err = clientValidate({ type: "image/jpeg", size });
      expect(err).toContain("9.2 MB");
    });
    it("accepts very small file (1 byte)", () => {
      expect(clientValidate({ type: "image/png", size: 1 })).toBeNull();
    });
  });

  describe("use cases: admin uploading blog hero image", () => {
    it("a 2 MB JPEG passes validation", () => {
      expect(clientValidate({ type: "image/jpeg", size: 2 * 1024 * 1024 })).toBeNull();
    });
    it("a 5 MB WebP passes validation", () => {
      expect(clientValidate({ type: "image/webp", size: 5 * 1024 * 1024 })).toBeNull();
    });
    it("a 10 MB PNG is rejected", () => {
      const err = clientValidate({ type: "image/png", size: 10 * 1024 * 1024 });
      expect(err).toContain("too large");
    });
    it("a Word document is rejected", () => {
      const err = clientValidate({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 500
      });
      expect(err).toBe("That isn't an image file.");
    });
  });
});
