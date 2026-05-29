import Link from "next/link";
import { ArrowLeft, FileText } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={12} weight="bold" /> Back to blog
      </Link>

      <section className="mt-6 border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex items-center gap-3 text-pine">
          <FileText size={22} weight="duotone" />
          <span className="eyebrow text-brass">New post</span>
        </div>
        <h1 className="headline-display mt-3 text-3xl md:text-4xl">Write a blog post.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The hero image shows on both the blog index and the article header. Drag in a photo or
          paste a URL.
        </p>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8">
        <BlogPostForm />
      </div>
    </main>
  );
}
