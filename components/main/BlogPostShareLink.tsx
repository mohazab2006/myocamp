import { XLogo } from "@phosphor-icons/react/dist/ssr";
import type { BlogPost } from "@/lib/types";
import { getXPostShareUrl } from "@/lib/blog-share";

type BlogPostShareLinkProps = {
  post: Pick<BlogPost, "slug" | "title">;
  className?: string;
};

export function BlogPostShareLink({ post, className = "" }: BlogPostShareLinkProps) {
  return (
    <a
      href={getXPostShareUrl(post)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Share ${post.title} on X`}
      className={`inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink ${className}`.trim()}
    >
      <XLogo size={14} weight="bold" aria-hidden />
      Share on X
    </a>
  );
}
