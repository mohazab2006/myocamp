import Link from "next/link";
import { ArrowSquareOut, PencilSimple, Trash } from "@phosphor-icons/react/ssr";

import { AdminDeleteForm } from "@/components/admin/delete-form";
import { formatPostDate } from "@/lib/date";
import type { BlogPost } from "@/lib/types";

type AdminBlogCardProps = {
  post: BlogPost;
  deleteAction: (formData: FormData) => void | Promise<void>;
  index?: number;
};

export function AdminBlogCard({ post, deleteAction, index = 0 }: AdminBlogCardProps) {
  const imageFirst = index % 2 === 0;

  return (
    <article className="border border-line bg-paper-deep/20 p-4 transition hover:border-pine md:p-5">
      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8">
        {post.heroImage ? (
          <div
            className={`overflow-hidden bg-paper-deep ${imageFirst ? "md:order-1" : "md:order-2"}`}
          >
            <img
              src={post.heroImage}
              alt=""
              className="h-44 w-full object-cover md:h-52"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ) : (
          <div
            className={`flex h-44 items-center justify-center border border-dashed border-line bg-paper-deep text-xs uppercase tracking-[0.16em] text-ink-soft md:h-52 ${
              imageFirst ? "md:order-1" : "md:order-2"
            }`}
          >
            No image
          </div>
        )}

        <div className={`flex flex-col ${imageFirst ? "md:order-2" : "md:order-1"}`}>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            {formatPostDate(post.publishedAt)}
          </div>
          <h2 className="headline-display mt-2 text-2xl tracking-tight text-ink md:text-3xl">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {post.excerpt}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/blog/${post.slug}/edit`}
              className="inline-flex h-10 items-center gap-1.5 bg-forest px-4 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-pine"
            >
              <PencilSimple size={12} weight="bold" />
              Edit
            </Link>
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 border border-line bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
            >
              View
              <ArrowSquareOut size={12} weight="bold" />
            </Link>
            <AdminDeleteForm
              action={deleteAction}
              slug={post.slug}
              label="Delete"
              confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
              icon={<Trash size={14} weight="bold" />}
              className="md:ml-auto"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
