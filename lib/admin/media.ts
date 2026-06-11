import "server-only";

import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const CONTENT_IMAGES_BUCKET = "content-images";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB cap — caught before Supabase rejects.

export type UploadedImage = {
  publicUrl: string;
  path: string;
};

/**
 * Upload an image to the public `content-images` bucket and return its public URL.
 * `folder` namespaces uploads — e.g. "events", "blog", "covers".
 */
export async function uploadContentImage(file: File, folder: string): Promise<UploadedImage> {
  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Unsupported image type: ${file.type || "unknown"}.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`);
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : file.type.split("/")[1];
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "misc";
  const objectPath = `${safeFolder}/${Date.now()}-${randomUUID()}.${extension ?? "bin"}`;

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(CONTENT_IMAGES_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(CONTENT_IMAGES_BUCKET).getPublicUrl(objectPath);

  return { publicUrl, path: objectPath };
}

/**
 * Best-effort delete of a previously uploaded image. Swallows errors —
 * orphans in storage are a cleanup problem, not a correctness one.
 */
export async function removeContentImage(publicUrl: string | null | undefined): Promise<boolean> {
  if (!publicUrl) return false;
  try {
    const marker = `/${CONTENT_IMAGES_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return false;
    const objectPath = publicUrl.slice(idx + marker.length);
    if (!objectPath) return false;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(CONTENT_IMAGES_BUCKET).remove([objectPath]);
    return !error;
  } catch {
    return false;
  }
}
