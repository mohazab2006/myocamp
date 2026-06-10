import type { BlogPost } from "../types";
import { blogSeedPosts } from "@/lib/content/blog-seed";
import {
  fetchSupabaseBlogPost,
  fetchSupabaseBlogPosts,
  isSupabaseConfigured
} from "@/lib/supabase/content";

const seedPosts: BlogPost[] = blogSeedPosts;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabasePosts = await fetchSupabaseBlogPosts();
  if (supabasePosts !== null) return supabasePosts;

  return [...seedPosts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    return fetchSupabaseBlogPost(slug);
  }
  return seedPosts.find((post) => post.slug === slug) ?? null;
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return seedPosts;
  const posts = (await fetchSupabaseBlogPosts()) ?? [];
  return [...posts].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export async function getAdminBlogPost(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) {
    return seedPosts.find((post) => post.slug === slug) ?? null;
  }
  return fetchSupabaseBlogPost(slug);
}
