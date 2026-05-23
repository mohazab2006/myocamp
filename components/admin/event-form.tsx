import { CheckCircle, PencilSimple, Plus } from "@phosphor-icons/react/ssr";

import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { saveEventAction } from "@/app/admin/actions";
import type { AudienceTag, EventType, OrgEvent } from "@/lib/types";

const eventTypes: EventType[] = [
  "hike",
  "campfire",
  "fundraiser",
  "social",
  "service",
  "camp",
  "workshop"
];
const audienceTags: AudienceTag[] = ["youth", "parents", "families", "leaders", "all"];

type EventFormProps = {
  event?: OrgEvent;
};

export function EventForm({ event }: EventFormProps) {
  return (
    <form action={saveEventAction} className="grid gap-5 border border-line bg-paper-deep/35 p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">
          {event ? event.title : "Add new event"}
        </h3>
        {event ? (
          <PencilSimple size={18} className="text-brass" />
        ) : (
          <Plus size={18} className="text-brass" />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Title" required>
          <input className={adminInputClass} name="title" defaultValue={event?.title} required />
        </AdminField>
        <AdminField label="Slug" hint="URL path (auto-generated from title and date if blank).">
          <input
            className={adminInputClass}
            name="slug"
            defaultValue={event?.slug}
            placeholder="auto-from-title-date"
          />
        </AdminField>
        <AdminField label="Type" required>
          <select
            className={adminInputClass}
            name="type"
            defaultValue={event?.type ?? "social"}
            required
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Cost" hint='"Free", "$25", "TBD" — shown next to the event title.'>
          <input
            className={adminInputClass}
            name="cost"
            defaultValue={event?.cost}
            placeholder="Free"
          />
        </AdminField>
        <AdminField label="Start date" required>
          <input
            className={adminInputClass}
            name="startDate"
            type="date"
            defaultValue={event?.startDate}
            required
          />
        </AdminField>
        <AdminField label="End date" hint="Leave blank for single-day events.">
          <input className={adminInputClass} name="endDate" type="date" defaultValue={event?.endDate} />
        </AdminField>
      </div>

      <AdminField label="Location" required>
        <input
          className={adminInputClass}
          name="location"
          defaultValue={event?.location}
          placeholder="Camp Smitty · Eganville, ON"
          required
        />
      </AdminField>

      <AdminField label="Audience" required hint="Who this event is for. Pick at least one.">
        <div className="flex flex-wrap gap-2">
          {audienceTags.map((tag) => (
            <label
              key={tag}
              className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm"
            >
              <input
                name="audience"
                type="checkbox"
                value={tag}
                defaultChecked={event?.audience.includes(tag) ?? tag === "youth"}
              />
              <span className="capitalize">{tag}</span>
            </label>
          ))}
        </div>
      </AdminField>

      <AdminField label="Summary" required hint="1–2 sentences shown on the events list.">
        <textarea
          className={adminTextareaClass}
          name="blurb"
          defaultValue={event?.blurb}
          required
        />
      </AdminField>
      <AdminField label="Full description" hint="Long-form copy for the event detail page.">
        <textarea
          className={`${adminTextareaClass} min-h-40`}
          name="body"
          defaultValue={event?.body}
        />
      </AdminField>

      <AdminField label="Hero image" hint="Shown at the top of the event page. Drag in or click to upload.">
        <ImageUploader name="heroImage" defaultValue={event?.heroImage} folder="events" />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Registration URL" hint="External JotForm / Eventbrite link.">
          <input
            className={adminInputClass}
            name="registerUrl"
            type="url"
            defaultValue={event?.registerUrl}
            placeholder="https://"
          />
        </AdminField>
        <AdminField label="Registration opens">
          <input
            className={adminInputClass}
            name="registerOpens"
            type="date"
            defaultValue={event?.registerOpens}
          />
        </AdminField>
        <AdminField label="Registration closes">
          <input
            className={adminInputClass}
            name="registerCloses"
            type="date"
            defaultValue={event?.registerCloses}
          />
        </AdminField>
      </div>

      <label className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft">
        <input name="archived" type="checkbox" defaultChecked={event?.archived} />
        Mark as archived (hides from the public events list)
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <AdminSubmitButton
          idleLabel={event ? "Save changes" : "Create event"}
          pendingLabel="Saving…"
          icon={<CheckCircle size={16} weight="bold" />}
        />
      </div>
    </form>
  );
}
