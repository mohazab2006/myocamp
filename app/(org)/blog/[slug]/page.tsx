import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarBlank } from "@phosphor-icons/react/ssr";
import { BlogPostBody } from "@/components/main/BlogPostBody";
import { BlogPostShareLink } from "@/components/main/BlogPostShareLink";
import { getBlogPost, getBlogPosts } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/date";
import { buildPageMetadata } from "@/lib/site";

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
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.heroImage
  });
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

        {post.links && post.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-8">
            {post.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  idx === 0
                    ? "group inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-pine"
                    : "group inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-5 py-2.5 text-sm font-medium text-ink transition hover:border-pine hover:text-pine"
                }
              >
                {link.label}
                <ArrowRight size={14} weight="bold" className="transition group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-line pt-8">
          <BlogPostShareLink post={post} />
        </div>
      </div>
    </article>
  );
}
