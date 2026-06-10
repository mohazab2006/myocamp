import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatPostDate } from "@/lib/date";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";

type BlogCardProps = {
  post: BlogPost;
  /** Newest post on the home page — date sits on the image, in front. */
  featured?: boolean;
};

export function BlogCard({ post, featured }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4 transition">
      <div className="relative overflow-hidden bg-paper-deep">
        {post.heroImage && (
          <img
            src={post.heroImage}
            alt=""
            className="w-full h-auto transition duration-700 group-hover:scale-[1.02]"
          />
        )}
        {featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-pine px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-paper shadow-sm">
            {formatPostDate(post.publishedAt)}
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-ink">
            Adventure
          </span>
        )}
      </div>
      <div>
        {!featured ? (
          <div className="text-xs uppercase tracking-[0.16em] text-ink-soft">
            {formatPostDate(post.publishedAt)}
          </div>
        ) : null}
        <h3 className="font-display mt-2 text-2xl leading-tight tracking-tight">{post.title}</h3>
        <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink">
          Read post <ArrowUpRight size={14} weight="bold" className="transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
