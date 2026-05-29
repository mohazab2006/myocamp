"use client";

import { useEffect, useState } from "react";

import { AdminField, adminInputClass } from "@/components/admin/field";
import { slugifyCampTitle } from "@/lib/slug";

type CampTitleSlugFieldsProps = {
  initialTitle?: string;
  initialSlug?: string;
  originalTitle?: string;
  originalSlug?: string;
};

export function CampTitleSlugFields({
  initialTitle = "",
  initialSlug = "",
  originalTitle,
  originalSlug
}: CampTitleSlugFieldsProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugManual, setSlugManual] = useState(() => {
    if (!initialSlug) return false;
    const auto = slugifyCampTitle(initialTitle);
    return initialSlug !== auto;
  });

  useEffect(() => {
    if (slugManual) return;
    const next = slugifyCampTitle(title);
    if (next) setSlug(next);
  }, [title, slugManual]);

  return (
    <>
      {originalTitle ? <input type="hidden" name="originalTitle" value={originalTitle} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Title" required>
          <input
            className={adminInputClass}
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="MYO Main Camp 2026"
            required
          />
        </AdminField>
        <AdminField
          label="URL slug"
          hint={
            slugManual
              ? "Custom slug — edit directly or clear to follow the title again."
              : "Updates automatically when you change the title."
          }
        >
          <input
            className={adminInputClass}
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            onBlur={() => {
              if (!slug.trim()) {
                setSlugManual(false);
                setSlug(slugifyCampTitle(title));
              }
            }}
            placeholder="main-camp-2026"
          />
          <p className="mt-1.5 text-[11px] text-ink-soft">
            Public URL: <code className="font-mono text-ink">/camp/{slug || "…"}/register</code>
            {originalSlug && slug !== originalSlug ? (
              <span className="ml-1 text-brass">(was /camp/{originalSlug}/register)</span>
            ) : null}
          </p>
        </AdminField>
      </div>
    </>
  );
}
