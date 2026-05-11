"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAuthClient, getAdminUser } from "@/lib/supabase/auth";
import {
  deleteSupabaseBlogPost,
  deleteSupabaseEvent,
  upsertSupabaseBlogPost,
  upsertSupabaseEvent
} from "@/lib/supabase/content";
import type { AudienceTag, BlogPost, EventType, OrgEvent } from "@/lib/types";

const eventTypes: EventType[] = ["hike", "campfire", "fundraiser", "social", "service", "camp", "workshop"];
const audienceTags: AudienceTag[] = ["youth", "parents", "families", "leaders", "all"];

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

function adminRedirect(params: Record<string, string>): never {
  const search = new URLSearchParams(params);
  redirect(`/admin?${search.toString()}`);
}

async function requireAdmin() {
  if (!(await getAdminUser())) {
    redirect("/admin?error=Please%20sign%20in%20again.");
  }
}

export async function loginAction(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");
  const supabase = await createSupabaseAuthClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  const user = data.user;

  if (error || !user) {
    adminRedirect({ error: error?.message ?? "Email or password is incorrect." });
  }

  const allowedEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes((user.email ?? "").toLowerCase())) {
    await supabase.auth.signOut();
    adminRedirect({ error: "This Supabase user is not allowed to access admin." });
  }

  adminRedirect({ saved: "Signed in." });
}

export async function logoutAction() {
  const supabase = await createSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveEventAction(formData: FormData) {
  await requireAdmin();

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
    adminRedirect({ error: "Event needs title, type, date, location, audience, and summary." });
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
    adminRedirect({ error: error instanceof Error ? error.message : "Could not save event." });
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  adminRedirect({ saved: "Event saved." });
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const slug = value(formData, "slug");
  if (!slug) adminRedirect({ error: "Missing event slug." });

  try {
    await deleteSupabaseEvent(slug);
  } catch (error) {
    adminRedirect({ error: error instanceof Error ? error.message : "Could not delete event." });
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  adminRedirect({ saved: "Event deleted." });
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin();

  const title = value(formData, "title");
  const publishedAt = value(formData, "publishedAt");
  const excerpt = value(formData, "excerpt");
  const slug = value(formData, "slug") || slugify(`${title}-${publishedAt}`);

  if (!title || !publishedAt || !excerpt) {
    adminRedirect({ error: "Blog post needs title, publish date, and excerpt." });
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
    adminRedirect({ error: error instanceof Error ? error.message : "Could not save blog post." });
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  adminRedirect({ saved: "Blog post saved." });
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const slug = value(formData, "slug");
  if (!slug) adminRedirect({ error: "Missing blog post slug." });

  try {
    await deleteSupabaseBlogPost(slug);
  } catch (error) {
    adminRedirect({ error: error instanceof Error ? error.message : "Could not delete blog post." });
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  adminRedirect({ saved: "Blog post deleted." });
}
