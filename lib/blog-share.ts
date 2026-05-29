import { absoluteUrl } from "@/lib/site";

export function getBlogPostUrl(slug: string): string {
  return absoluteUrl(`/blog/${slug}`);
}

export function getXPostShareUrl(post: { slug: string; title: string }): string {
  const params = new URLSearchParams({
    url: getBlogPostUrl(post.slug),
    text: post.title
  });

  return `https://x.com/intent/tweet?${params.toString()}`;
}
