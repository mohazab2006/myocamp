import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatPostDate } from "@/lib/date";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { BlogPostShareLink } from "@/components/main/BlogPostShareLink";

type BlogFeedEntryProps = {
  post: BlogPost;
  index: number;
};

export function BlogFeedEntry({ post, index }: BlogFeedEntryProps) {
  const imageFirst = index % 2 === 0;

  return (
    <article className="border-b border-line pb-10 last:border-b-0 last:pb-0 md:pb-12">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8"
      >
        {post.heroImage && (
          <div
            className={`overflow-hidden bg-paper-deep ${
              imageFirst ? "md:order-1" : "md:order-2"
            }`}
          >
            <img
              src={post.heroImage}
              alt=""
              className="h-44 w-full object-cover transition duration-700 group-hover:scale-[1.03] md:h-52"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        )}

        <div className={imageFirst ? "md:order-2" : "md:order-1"}>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            {formatPostDate(post.publishedAt)}
          </div>
          <h2 className="headline-display mt-2 text-2xl tracking-tight text-ink md:text-3xl">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {post.excerpt}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
            Read post
            <ArrowUpRight
              size={14}
              weight="bold"
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </Link>

      {post.links && post.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                idx === 0
                  ? "group inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-medium text-paper transition hover:bg-pine"
                  : "group inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-4 py-2 text-xs font-medium text-ink transition hover:border-pine hover:text-pine"
              }
            >
              {link.label}
              <ArrowRight size={12} weight="bold" className="transition group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-4">
        <BlogPostShareLink post={post} />
      </div>
    </article>
  );
}
