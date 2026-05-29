import Link from "next/link";
import { ArrowSquareOut, FileText, Plus, Trash } from "@phosphor-icons/react/ssr";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { BlogPostForm } from "@/components/admin/blog-post-form";
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
            <h1 className="headline-display mt-3 text-3xl md:text-4xl">
              Write and publish stories.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Posts appear at <code className="border border-line bg-paper px-1 py-0.5 text-xs">/blog</code>{" "}
              and each one lives at <code className="border border-line bg-paper px-1 py-0.5 text-xs">/blog/[slug]</code>.
              The hero image shows on both the index card and the article header.
            </p>
          </div>
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            View live
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
        <AdminFlashBanner message={message} type={type} className="mt-6" />
      </section>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <Plus size={14} weight="bold" /> Add a new post
      </div>
      <div className="mt-3">
        <BlogPostForm />
      </div>

      <div className="mt-12 flex items-center gap-3 border-b border-line pb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
        <FileText size={14} weight="bold" /> Existing posts ({posts.length})
      </div>

      <div className="mt-6 grid gap-10">
        {posts.length === 0 ? (
          <p className="border border-dashed border-line bg-paper-deep/20 p-6 text-sm text-ink-soft">
            No posts in the database yet. Use the form above to publish your first story.
            {supabaseContent ? (
              <>
                {" "}
                The public site may still show built-in demo posts until you add real ones here.
              </>
            ) : null}
          </p>
        ) : null}

        {posts.map((post) => (
          <div key={post.slug} className="grid gap-3">
            <BlogPostForm post={post} />
            <form action={deleteBlogPostAction} className="flex justify-end">
              <input type="hidden" name="slug" value={post.slug} />
              <AdminSubmitButton
                idleLabel="Delete post"
                pendingLabel="Deleting…"
                variant="danger"
                icon={<Trash size={14} weight="bold" />}
              />
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
