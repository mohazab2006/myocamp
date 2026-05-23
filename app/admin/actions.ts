"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAuthClient, getAdminUser } from "@/lib/admin/auth";
import { getAdminAllowlist } from "@/lib/admin/allowlist";
import { uploadContentImage } from "@/lib/admin/media";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import {
  deleteSupabaseBlogPost,
  deleteSupabaseEvent,
  upsertSupabaseBlogPost,
  upsertSupabaseCampSettings,
  upsertSupabaseEvent
} from "@/lib/supabase/content";
import type { AudienceTag, BlogPost, CampSettings, EventType, OrgEvent } from "@/lib/types";

const eventTypes: EventType[] = [
  "hike",
  "campfire",
  "fundraiser",
  "social",
  "service",
  "camp",
  "workshop"
];
const audienceTags: AudienceTag[] = ["youth", "parents", "families", "leaders", "all"];
const registrationStatuses: CampSettings["registrationStatus"][] = [
  "open",
  "full",
  "closed",
  "opening-soon"
];

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function compact<T extends object>(record: T) {
  return Object.fromEntries(
    Object.entries(record as Record<string, unknown>).filter(([, entry]) => {
      if (Array.isArray(entry)) return entry.length > 0;
      return entry !== "" && entry !== undefined && entry !== null;
    })
  ) as T;
}

function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

async function requireAdmin(redirectBase = "/admin") {
  if (!(await getAdminUser())) {
    flash(redirectBase, "error", "Please sign in again.");
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginAction(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");
  const supabase = await createSupabaseAuthClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  const user = data.user;

  if (error || !user) {
    flash("/admin", "error", error?.message ?? "Email or password is incorrect.");
  }

  const allowlist = getAdminAllowlist();
  if (allowlist.length > 0 && !allowlist.includes((user!.email ?? "").toLowerCase())) {
    await supabase.auth.signOut();
    flash("/admin", "error", "This Supabase user is not on the admin allowlist.");
  }

  flash("/admin", "success", "Signed in.");
}

export async function logoutAction() {
  const supabase = await createSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// Image upload (called from the client-side ImageUploader)
// ---------------------------------------------------------------------------

export type UploadImageResult = {
  url: string | null;
  error: string | null;
};

export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  if (!(await getAdminUser())) {
    return { url: null, error: "Not authorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { url: null, error: "No file received." };
  }

  const folderRaw = String(formData.get("folder") ?? "misc");
  const folder = folderRaw.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "misc";

  try {
    const { publicUrl } = await uploadContentImage(file, folder);
    return { url: publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err instanceof Error ? err.message : "Upload failed." };
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function saveEventAction(formData: FormData) {
  await requireAdmin("/admin/events");

  const title = value(formData, "title");
  const startDate = value(formData, "startDate");
  const location = value(formData, "location");
  const blurb = value(formData, "blurb");
  const type = value(formData, "type") as EventType;
  const slug = value(formData, "slug") || slugify(`${title}-${startDate}`);
  const audience = formData
    .getAll("audience")
    .map((entry) => String(entry))
    .filter((entry): entry is AudienceTag => audienceTags.includes(entry as AudienceTag));

  if (!title || !startDate || !location || !blurb || !eventTypes.includes(type) || audience.length === 0) {
    flash(
      "/admin/events",
      "error",
      "Event needs title, type, date, location, audience, and summary."
    );
  }

  const event = compact<OrgEvent>({
    slug,
    title,
    type,
    startDate,
    endDate: value(formData, "endDate"),
    location,
    audience,
    blurb,
    body: value(formData, "body"),
    heroImage: value(formData, "heroImage"),
    registerUrl: value(formData, "registerUrl"),
    registerOpens: value(formData, "registerOpens"),
    registerCloses: value(formData, "registerCloses"),
    cost: value(formData, "cost"),
    archived: formData.get("archived") === "on" ? true : undefined
  });

  try {
    await upsertSupabaseEvent(event);
  } catch (error) {
    flash(
      "/admin/events",
      "error",
      error instanceof Error ? error.message : "Could not save event."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  flash("/admin/events", "success", `Saved "${event.title}".`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin("/admin/events");
  const slug = value(formData, "slug");
  if (!slug) flash("/admin/events", "error", "Missing event slug.");

  try {
    await deleteSupabaseEvent(slug);
  } catch (error) {
    flash(
      "/admin/events",
      "error",
      error instanceof Error ? error.message : "Could not delete event."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  flash("/admin/events", "success", "Event deleted.");
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin("/admin/blog");

  const title = value(formData, "title");
  const publishedAt = value(formData, "publishedAt");
  const excerpt = value(formData, "excerpt");
  const slug = value(formData, "slug") || slugify(`${title}-${publishedAt}`);

  if (!title || !publishedAt || !excerpt) {
    flash("/admin/blog", "error", "Blog post needs title, publish date, and excerpt.");
  }

  const post = compact<BlogPost>({
    slug,
    title,
    publishedAt,
    excerpt,
    heroImage: value(formData, "heroImage"),
    body: value(formData, "body")
  });

  try {
    await upsertSupabaseBlogPost(post);
  } catch (error) {
    flash(
      "/admin/blog",
      "error",
      error instanceof Error ? error.message : "Could not save blog post."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  flash("/admin/blog", "success", `Saved "${post.title}".`);
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin("/admin/blog");
  const slug = value(formData, "slug");
  if (!slug) flash("/admin/blog", "error", "Missing blog post slug.");

  try {
    await deleteSupabaseBlogPost(slug);
  } catch (error) {
    flash(
      "/admin/blog",
      "error",
      error instanceof Error ? error.message : "Could not delete blog post."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  flash("/admin/blog", "success", "Blog post deleted.");
}

// ---------------------------------------------------------------------------
// Camp settings
// ---------------------------------------------------------------------------

export async function saveCampStatusAction(formData: FormData) {
  await requireAdmin("/admin/camp");

  const candidate = value(formData, "registrationStatus") as CampSettings["registrationStatus"];
  if (!registrationStatuses.includes(candidate)) {
    flash("/admin/camp", "error", "Pick a valid registration status.");
  }

  try {
    await upsertSupabaseCampSettings({ registrationStatus: candidate });
  } catch (error) {
    flash(
      "/admin/camp",
      "error",
      error instanceof Error ? error.message : "Could not save camp status."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/camp");
  revalidatePath("/camp");
  revalidatePath("/camp/register");
  flash("/admin/camp", "success", "Registration status updated.");
}
