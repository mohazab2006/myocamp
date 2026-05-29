import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, FileText } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminBlogPost } from "@/lib/content/blog";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function AdminBlogEditPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { slug } = await params;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const post = await getAdminBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to blog
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-pine">
              <FileText size={22} weight="duotone" />
              <span className="eyebrow text-brass">Edit post</span>
            </div>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">{post.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Changes publish immediately on the public blog.
            </p>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View live
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <BlogPostForm post={post} />
      </div>
    </main>
  );
}
