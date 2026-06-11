"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import {
  CheckCircle,
  CircleNotch,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash
} from "@phosphor-icons/react";

import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { saveBlogPostAction, uploadImageAction } from "@/app/admin/actions";
import type { BlogLink, BlogPost } from "@/lib/types";

type BlogPostFormProps = {
  post?: BlogPost;
};

export function BlogPostForm({ post }: BlogPostFormProps) {
  const [links, setLinks] = useState<BlogLink[]>(post?.links ?? []);
  const [body, setBody] = useState(post?.body ?? "");
  const [insertingImage, startInsert] = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addLink = () => setLinks((prev) => [...prev, { url: "", label: "" }]);

  const removeLink = (idx: number) =>
    setLinks((prev) => prev.filter((_, i) => i !== idx));

  const updateLink = (idx: number, field: keyof BlogLink, val: string) =>
    setLinks((prev) =>
      prev.map((link, i) => (i === idx ? { ...link, [field]: val } : link))
    );

  const handleBodyImageFile = useCallback(
    (file: File) => {
      startInsert(async () => {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "blog");
        const result = await uploadImageAction(fd);
        if (result.url) {
          const ta = bodyRef.current;
          if (!ta) return;
          const start = ta.selectionStart ?? body.length;
          const end = ta.selectionEnd ?? body.length;
          const insertion = `\n<img src="${result.url}" alt="" style="max-width:100%;height:auto;" />\n`;
          const newBody = body.slice(0, start) + insertion + body.slice(end);
          setBody(newBody);
          setTimeout(() => {
            ta.setSelectionRange(start + insertion.length, start + insertion.length);
            ta.focus();
          }, 0);
        }
      });
    },
    [body]
  );

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

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Post body
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-soft">Plain text or HTML · images below</span>
            <button
              type="button"
              disabled={insertingImage}
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft transition hover:border-pine hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {insertingImage ? (
                <CircleNotch size={12} weight="bold" className="animate-spin" />
              ) : (
                <ImageIcon size={12} weight="duotone" />
              )}
              {insertingImage ? "Uploading…" : "Insert image"}
            </button>
          </div>
        </div>
        <textarea
          ref={bodyRef}
          className={`${adminTextareaClass} min-h-52 font-mono text-xs`}
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleBodyImageFile(file);
          }}
        />
        <p className="text-xs text-ink-soft">
          Click &ldquo;Insert image&rdquo; to upload and insert an{" "}
          <code className="rounded bg-paper-deep px-1 py-0.5">&lt;img&gt;</code> tag at your
          cursor. Supports basic HTML: &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;br&gt;,
          &lt;ul&gt;/&lt;li&gt;.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Links{" "}
            <span className="ml-1 font-normal normal-case tracking-normal text-ink-soft">
              — buttons shown on the post and blog cards
            </span>
          </span>
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft transition hover:border-pine hover:text-ink"
          >
            <Plus size={12} weight="bold" />
            Add link
          </button>
        </div>

        {links.length === 0 && (
          <p className="text-xs text-ink-soft">
            No links yet. Add links to show action buttons on this post (e.g. a survey, sign-up form, or newsletter).
          </p>
        )}

        {links.map((link, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
            <div className="grid gap-1">
              <label className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                Button label
              </label>
              <input
                className={adminInputClass}
                name={`link_label_${idx}`}
                value={link.label}
                onChange={(e) => updateLink(idx, "label", e.target.value)}
                placeholder="e.g. Fill out the survey"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                URL
              </label>
              <input
                className={adminInputClass}
                name={`link_url_${idx}`}
                value={link.url}
                onChange={(e) => updateLink(idx, "url", e.target.value)}
                placeholder="https://"
              />
            </div>
            <button
              type="button"
              onClick={() => removeLink(idx)}
              className="mt-6 inline-flex h-11 w-11 items-center justify-center border border-line text-ink-soft transition hover:border-ember hover:text-ember"
            >
              <Trash size={14} weight="bold" />
            </button>
          </div>
        ))}

        <input type="hidden" name="linksJson" value={JSON.stringify(links)} />
      </div>

      <AdminField label="Hero image" hint="Shown at the top of the post and as the blog index thumbnail.">
        <div className="max-w-xs">
          <ImageUploader name="heroImage" defaultValue={post?.heroImage} folder="blog" />
        </div>
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
