import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { BlogPost, OrgEvent } from "@/lib/types";

type EventRow = {
  slug: string;
  start_date: string | null;
  data: OrgEvent;
};

type BlogPostRow = {
  slug: string;
  published_at: string | null;
  data: BlogPost;
};

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export function getSupabaseContentClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function fetchSupabaseEvents() {
  const supabase = getSupabaseContentClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("content_events")
    .select("slug,start_date,data")
    .order("start_date", { ascending: true });

  if (error) {
    console.warn("Supabase events unavailable, falling back to seed content:", error.message);
    return null;
  }

  return (data as EventRow[]).map((row) => ({ ...row.data, slug: row.slug }));
}

export async function fetchSupabaseEvent(slug: string) {
  const supabase = getSupabaseContentClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("content_events")
    .select("slug,data")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Pick<EventRow, "slug" | "data">;
  return { ...row.data, slug: row.slug };
}

export async function fetchSupabaseBlogPosts() {
  const supabase = getSupabaseContentClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("content_blog_posts")
    .select("slug,published_at,data")
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("Supabase blog posts unavailable, falling back to seed content:", error.message);
    return null;
  }

  return (data as BlogPostRow[]).map((row) => ({ ...row.data, slug: row.slug }));
}

export async function fetchSupabaseBlogPost(slug: string) {
  const supabase = getSupabaseContentClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("content_blog_posts")
    .select("slug,data")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Pick<BlogPostRow, "slug" | "data">;
  return { ...row.data, slug: row.slug };
}

export async function upsertSupabaseEvent(event: OrgEvent) {
  const supabase = getSupabaseContentClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("content_events").upsert({
    slug: event.slug,
    title: event.title,
    start_date: event.startDate,
    data: event
  });

  if (error) throw new Error(error.message);
}

export async function deleteSupabaseEvent(slug: string) {
  const supabase = getSupabaseContentClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("content_events").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function upsertSupabaseBlogPost(post: BlogPost) {
  const supabase = getSupabaseContentClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("content_blog_posts").upsert({
    slug: post.slug,
    title: post.title,
    published_at: post.publishedAt,
    data: post
  });

  if (error) throw new Error(error.message);
}

export async function deleteSupabaseBlogPost(slug: string) {
  const supabase = getSupabaseContentClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("content_blog_posts").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
