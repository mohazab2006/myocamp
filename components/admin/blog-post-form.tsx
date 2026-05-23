import { CheckCircle, FileText, Plus } from "@phosphor-icons/react/ssr";

import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { saveBlogPostAction } from "@/app/admin/actions";
import type { BlogPost } from "@/lib/types";

type BlogPostFormProps = {
  post?: BlogPost;
};

export function BlogPostForm({ post }: BlogPostFormProps) {
  return (
    <form action={saveBlogPostAction} className="grid gap-5 border border-line bg-paper-deep/35 p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">
          {post ? post.title : "Add new blog post"}
        </h3>
        {post ? (
          <FileText size={18} className="text-brass" />
        ) : (
          <Plus size={18} className="text-brass" />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Title" required>
          <input className={adminInputClass} name="title" defaultValue={post?.title} required />
        </AdminField>
        <AdminField label="Slug" hint="URL path (auto-generated from title and date if blank).">
          <input
            className={adminInputClass}
            name="slug"
            defaultValue={post?.slug}
            placeholder="auto-from-title-date"
          />
        </AdminField>
        <AdminField label="Publish date" required>
          <input
            className={adminInputClass}
            name="publishedAt"
            type="date"
            defaultValue={post?.publishedAt}
            required
          />
        </AdminField>
      </div>

      <AdminField label="Excerpt" required hint="Short preview shown on the blog index.">
        <textarea
          className={adminTextareaClass}
          name="excerpt"
          defaultValue={post?.excerpt}
          required
        />
      </AdminField>
      <AdminField label="Post body" hint="Full post content. Plain text or simple HTML.">
        <textarea
          className={`${adminTextareaClass} min-h-52`}
          name="body"
          defaultValue={post?.body}
        />
      </AdminField>

      <AdminField label="Hero image" hint="Shown at the top of the post and as the blog index thumbnail.">
        <ImageUploader name="heroImage" defaultValue={post?.heroImage} folder="blog" />
      </AdminField>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <AdminSubmitButton
          idleLabel={post ? "Save changes" : "Create post"}
          pendingLabel="Saving…"
          icon={<CheckCircle size={16} weight="bold" />}
        />
      </div>
    </form>
  );
}
