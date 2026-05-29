import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content/blog";
import { BlogFeedEntry } from "@/components/main/BlogFeedEntry";
import { PageHero } from "@/components/main/PageHero";
import { RevealOnScroll } from "@/components/main/RevealOnScroll";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Adventure Blog",
  description:
    "Past and upcoming MYO adventures — hikes, service days, and community meetups at myo.camp.",
  path: "/blog"
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="Adventure Blog"
        title="Find our past and upcoming adventures here."
        description="Trip write-ups, hike announcements, and community days from MYO Monthly Adventures and the wider MYO calendar."
      />

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
          <RevealOnScroll className="space-y-10 md:space-y-12" y={24} stagger={0.08}>
            {posts.map((post, index) => (
              <BlogFeedEntry key={post.slug} post={post} index={index} />
            ))}
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
