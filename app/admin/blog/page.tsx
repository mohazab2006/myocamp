import Link from "next/link";
import { ArrowSquareOut, FileText, Plus } from "@phosphor-icons/react/ssr";

import { AdminBlogCard } from "@/components/admin/admin-blog-card";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminBlogPosts } from "@/lib/content/blog";
import { isSupabaseConfigured } from "@/lib/supabase/content";

import { deleteBlogPostAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const posts = await getAdminBlogPosts();
  const supabaseContent = isSupabaseConfigured();

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <section className="border border-line bg-paper-deep/45 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow text-brass">Blog</span>
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">Manage blog posts.</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Posts appear at <code className="border border-line bg-paper px-1 py-0.5 text-xs">/blog</code>{" "}
              and each one lives at{" "}
              <code className="border border-line bg-paper px-1 py-0.5 text-xs">/blog/[slug]</code>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex h-11 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              View live
              <ArrowSquareOut size={12} weight="bold" />
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
            >
              <Plus size={16} weight="bold" /> Add post
            </Link>
          </div>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-10 flex items-center gap-3 border-b border-line pb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <FileText size={14} weight="bold" /> All posts ({posts.length})
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-paper-deep/20 p-10 text-center">
          <p className="font-display text-xl tracking-tight text-ink">No posts yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            Publish your first story to show it on the adventure blog.
            {supabaseContent ? " Demo posts on the live site disappear once you add real ones here." : null}
          </p>
          <Link
            href="/admin/blog/new"
            className="mt-6 inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine"
          >
            <Plus size={16} weight="bold" /> Write your first post
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8">
          {posts.map((post, index) => (
            <AdminBlogCard
              key={post.slug}
              post={post}
              index={index}
              deleteAction={deleteBlogPostAction}
            />
          ))}
        </div>
      )}
    </main>
  );
}
