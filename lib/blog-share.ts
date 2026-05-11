const SITE_ORIGIN = "https://myo.camp";

export function getBlogPostUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog/${slug}`;
}

export function getXPostShareUrl(post: { slug: string; title: string }): string {
  const params = new URLSearchParams({
    url: getBlogPostUrl(post.slug),
    text: post.title
  });

  return `https://x.com/intent/tweet?${params.toString()}`;
}
