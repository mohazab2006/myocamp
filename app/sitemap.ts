import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/lib/content/blog";
import { fetchPublicCampsIndex } from "@/lib/content/camps-public";
import { getEvents } from "@/lib/content/events";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts, camps] = await Promise.all([
    getEvents(),
    getBlogPosts(),
    fetchPublicCampsIndex()
  ]);

  const now = new Date();

  const staticPaths = [
    "/",
    "/about",
    "/contact",
    "/support",
    "/events",
    "/blog",
    "/camp",
    "/camp/story",
    "/camp/location",
    "/camp/register",
    "/camp/rules",
    "/camp/support"
  ];

  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.startsWith("/camp") ? 0.9 : 0.7
    })),
    ...events.map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5
    })),
    ...camps.map((camp) => ({
      url: absoluteUrl(camp.registerPath),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85
    }))
  ];
}
