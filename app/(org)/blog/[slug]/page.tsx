import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { BlogPostBody } from "@/components/main/BlogPostBody";
import { BlogPostShareLink } from "@/components/main/BlogPostShareLink";
import { getBlogPost, getBlogPosts } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/date";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="border-t border-line bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-14">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} weight="bold" /> Adventure blog
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-soft">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1">
            <CalendarBlank size={14} />
            {formatPostDate(post.publishedAt)}
          </span>
        </div>

        <h1 className="headline-display mt-5 text-3xl text-ink md:text-5xl">{post.title}</h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-soft md:text-lg">{post.excerpt}</p>

        {post.heroImage && (
          <div className="mt-8 bg-paper-deep">
            <img
              src={post.heroImage}
              alt=""
              className="h-auto w-full max-w-none"
            />
          </div>
        )}

        <BlogPostBody body={post.body ?? post.excerpt} />

        <div className="mt-10 border-t border-line pt-8">
          <BlogPostShareLink post={post} />
        </div>
      </div>
    </article>
  );
}
