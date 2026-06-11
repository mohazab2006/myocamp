"use client";

import { useState } from "react";
import { CheckCircle, Megaphone, Plus, Trash } from "@phosphor-icons/react";

import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { saveAnnouncementAction } from "@/app/admin/actions";
import type { AnnouncementLink, AnnouncementOverride } from "@/lib/types";

type AnnouncementFormProps = {
  override?: AnnouncementOverride;
};

export function AnnouncementForm({ override }: AnnouncementFormProps) {
  const [enabled, setEnabled] = useState(override?.enabled ?? false);
  const [links, setLinks] = useState<AnnouncementLink[]>(override?.links ?? []);

  const addLink = () => setLinks((prev) => [...prev, { href: "", label: "", primary: prev.length === 0 }]);
  const removeLink = (idx: number) => setLinks((prev) => prev.filter((_, i) => i !== idx));
  const updateLink = (idx: number, field: keyof AnnouncementLink, val: string | boolean) =>
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));

  return (
    <form action={saveAnnouncementAction} className="grid gap-6 border border-line bg-paper-deep/35 p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Megaphone size={18} className="text-ember" />
        <h3 className="font-display text-2xl tracking-tight text-ink">Announcement Banner</h3>
      </div>

      <p className="text-sm leading-relaxed text-ink-soft">
        Controls the highlighted banner at the top of the home page. When enabled, this overrides
        the automatic camp-registration message. Turn it off to revert to automatic.
      </p>

      {/* Toggle */}
      <label className="inline-flex cursor-pointer items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`h-6 w-11 rounded-full transition ${enabled ? "bg-forest" : "bg-line"}`}
          />
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${
              enabled ? "left-[1.375rem]" : "left-0.5"
            }`}
          />
        </div>
        <span className="text-sm font-medium text-ink">
          {enabled ? "Banner enabled — showing on home page" : "Banner disabled — auto mode"}
        </span>
      </label>

      <div className={`grid gap-4 ${!enabled ? "pointer-events-none opacity-50" : ""}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField
            label="Badge label"
            hint='Short badge text. Default is "Big News".'
          >
            <input
              className={adminInputClass}
              name="label"
              defaultValue={override?.label ?? ""}
              placeholder="Big News"
            />
          </AdminField>
          <AdminField label="Highlight text" hint="Bold green text appended to the message (optional).">
            <input
              className={adminInputClass}
              name="highlight"
              defaultValue={override?.highlight ?? ""}
              placeholder="e.g. opening soon!"
            />
          </AdminField>
        </div>

        <AdminField label="Message" required hint="Main announcement text shown to all visitors.">
          <textarea
            className={adminTextareaClass}
            name="message"
            defaultValue={override?.message ?? ""}
            placeholder="e.g. New Camps! Don't miss out on registration opening…"
          />
        </AdminField>

        {/* Links */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Links
              <span className="ml-1 font-normal normal-case tracking-normal text-ink-soft">
                — buttons shown in the banner (first link is primary/bold)
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
            <p className="text-xs text-ink-soft">No links yet. Add links to show buttons in the banner.</p>
          )}

          {links.map((link, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <div className="grid gap-1">
                <label className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Button label
                </label>
                <input
                  className={adminInputClass}
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
                  value={link.href}
                  onChange={(e) => updateLink(idx, "href", e.target.value)}
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
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <AdminSubmitButton
          idleLabel="Save announcement"
          pendingLabel="Saving…"
          icon={<CheckCircle size={16} weight="bold" />}
        />
      </div>
    </form>
  );
}
