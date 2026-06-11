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
import type {
  AnnouncementLink,
  AnnouncementOverride,
  AudienceTag,
  BlogLink,
  BlogPost,
  CampSettings,
  EventType,
  OrgEvent
} from "@/lib/types";

const eventTypes: EventType[] = [
  "hike",
  "campfire",
  "fundraiser",
  "social",
  "service",
  "camp",
  "workshop"
];
const eventAudienceTags: AudienceTag[] = ["brothers", "sisters", "all"];
const audienceTags: AudienceTag[] = [
  "youth",
  "parents",
  "families",
  "leaders",
  "brothers",
  "sisters",
  "all"
];
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
  const audienceRaw = value(formData, "audience");
  const audience: AudienceTag[] =
    audienceRaw && eventAudienceTags.includes(audienceRaw as AudienceTag)
      ? [audienceRaw as AudienceTag]
      : formData
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
    campSlug: value(formData, "campSlug"),
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
  revalidatePath(`/admin/events/${event.slug}/edit`);
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
  revalidatePath(`/admin/events/${slug}/edit`);
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
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

  let links: BlogLink[] = [];
  const linksJsonRaw = value(formData, "linksJson");
  if (linksJsonRaw) {
    try {
      const parsed = JSON.parse(linksJsonRaw);
      if (Array.isArray(parsed)) {
        links = parsed
          .filter((l) => l && typeof l.url === "string" && l.url.trim())
          .map((l) => ({ url: String(l.url).trim(), label: String(l.label ?? "").trim() || "Learn more" }));
      }
    } catch {
      // malformed JSON — ignore
    }
  }

  const post = compact<BlogPost>({
    slug,
    title,
    publishedAt,
    excerpt,
    heroImage: value(formData, "heroImage"),
    body: value(formData, "body"),
    links: links.length > 0 ? links : undefined
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
  revalidatePath(`/admin/blog/${post.slug}/edit`);
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
  revalidatePath(`/admin/blog/${slug}/edit`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  flash("/admin/blog", "success", "Blog post deleted.");
}

// ---------------------------------------------------------------------------
// Announcement banner
// ---------------------------------------------------------------------------

export async function saveAnnouncementAction(formData: FormData) {
  await requireAdmin("/admin/announcement");

  const enabled = formData.get("enabled") === "on";
  const label = value(formData, "label") || undefined;
  const message = value(formData, "message");
  const highlight = value(formData, "highlight") || undefined;

  if (enabled && !message) {
    flash("/admin/announcement", "error", "Message is required when the announcement is enabled.");
  }

  let links: AnnouncementLink[] = [];
  const linksJsonRaw = value(formData, "linksJson");
  if (linksJsonRaw) {
    try {
      const parsed = JSON.parse(linksJsonRaw);
      if (Array.isArray(parsed)) {
        links = parsed
          .filter((l) => l && typeof l.href === "string" && l.href.trim())
          .map((l, i) => ({
            href: String(l.href).trim(),
            label: String(l.label ?? "").trim() || "Learn more",
            primary: i === 0
          }));
      }
    } catch {
      // malformed JSON — ignore
    }
  }

  const override: AnnouncementOverride = {
    enabled,
    label,
    message,
    highlight,
    links
  };

  try {
    await upsertSupabaseCampSettings({ announcementOverride: override });
  } catch (error) {
    flash(
      "/admin/announcement",
      "error",
      error instanceof Error ? error.message : "Could not save announcement."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/announcement");
  revalidatePath("/");
  flash("/admin/announcement", "success", "Announcement saved.");
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
