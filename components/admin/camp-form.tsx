import { CheckCircle } from "@phosphor-icons/react/ssr";

import { AdminField, adminInputClass, adminTextareaClass } from "@/components/admin/field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import type { Camp } from "@/lib/types";

import { createCampAction, updateCampAction } from "@/app/admin/camps/actions";

const statusOptions: { value: Camp["status"]; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Not visible on the public site yet." },
  { value: "open", label: "Open", hint: "Registration form is live on /camp." },
  { value: "full", label: "Full", hint: "Registration closed; waitlist form is live." },
  { value: "closed", label: "Closed", hint: "Registration closed. Waitlist stays open if the camp is at capacity." },
  {
    value: "archived",
    label: "Archived",
    hint: "Past camp, kept for records. Not shown on /camp."
  }
];

type CampFormProps = {
  camp?: Camp;
};

export function CampForm({ camp }: CampFormProps) {
  const isEditing = Boolean(camp);
  const action = isEditing ? updateCampAction : createCampAction;

  return (
    <form action={action} className="grid gap-6 border border-line bg-paper-deep/35 p-6 md:p-8">
      {isEditing && camp ? (
        <>
          <input type="hidden" name="id" value={camp.id} />
          <input type="hidden" name="originalSlug" value={camp.slug} />
        </>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Title" required>
          <input
            className={adminInputClass}
            name="title"
            defaultValue={camp?.title}
            placeholder="MYO Main Camp 2026"
            required
          />
        </AdminField>
        <AdminField label="Slug" hint="URL path. Auto-generated from title if blank.">
          <input
            className={adminInputClass}
            name="slug"
            defaultValue={camp?.slug}
            placeholder="main-camp-2026"
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminField
          label="Status"
          required
          hint={statusOptions.find((s) => s.value === (camp?.status ?? "draft"))?.hint}
        >
          <select className={adminInputClass} name="status" defaultValue={camp?.status ?? "draft"}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Capacity" hint="Total spots. Leave blank for unlimited.">
          <input
            className={adminInputClass}
            name="capacity"
            type="number"
            min={1}
            defaultValue={camp?.capacity ?? ""}
            placeholder="30"
          />
        </AdminField>
        <AdminField label="Fee per camper (CAD)" required>
          <input
            className={adminInputClass}
            name="feePerCamper"
            type="number"
            min={0}
            step="0.01"
            defaultValue={camp?.feePerCamper ?? 0}
            placeholder="325"
            required
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Start date" required>
          <input
            className={adminInputClass}
            name="startDate"
            type="date"
            defaultValue={camp?.startDate}
            required
          />
        </AdminField>
        <AdminField label="End date" required>
          <input
            className={adminInputClass}
            name="endDate"
            type="date"
            defaultValue={camp?.endDate}
            required
          />
        </AdminField>
      </div>

      <AdminField label="Location">
        <input
          className={adminInputClass}
          name="location"
          defaultValue={camp?.location ?? ""}
          placeholder="Camp Smitty · Eganville, ON"
        />
      </AdminField>

      <AdminField
        label="Hero image"
        hint="Shown on the events page when an event is linked to this camp, and on the camp registration picker."
      >
        <div className="max-w-xs">
          <ImageUploader name="heroImage" defaultValue={camp?.heroImage ?? ""} folder="camps" />
        </div>
      </AdminField>

      <label className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft">
        <input
          name="featuredOnEvents"
          type="checkbox"
          defaultChecked={camp?.featuredOnEvents ?? false}
        />
        Feature this camp on the events page (only one camp can be featured at a time)
      </label>

      <AdminField
        label="E-Transfer payment email"
        hint="Shown on the public payment page for this camp. Falls back to PAYMENT_EMAIL env var."
      >
        <input
          className={adminInputClass}
          name="paymentEmail"
          type="email"
          defaultValue={camp?.paymentEmail ?? ""}
          placeholder="payments@myo.camp"
        />
      </AdminField>

      <div className="border border-line bg-paper p-5">
        <p className="eyebrow text-brass">JotForm integration</p>
        <h3 className="mt-2 font-display text-xl tracking-tight text-ink">
          Forms — swap any time
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          Paste the JotForm form ID (the numbers in the form URL,
          e.g. <code className="border border-line bg-paper-deep px-1">jotform.com/form/<b>251234567890</b></code>).
          The site will show the registration form while the camp is Open and the waitlist
          form when it's Full.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <AdminField label="Registration form ID" hint="Active when status = Open.">
            <input
              className={adminInputClass}
              name="registrationFormJotformId"
              defaultValue={camp?.registrationFormJotformId ?? ""}
              placeholder="251234567890"
            />
          </AdminField>
          <AdminField
            label="Waitlist form ID"
            hint="Active when status = Full. Optional but recommended."
          >
            <input
              className={adminInputClass}
              name="waitlistFormJotformId"
              defaultValue={camp?.waitlistFormJotformId ?? ""}
              placeholder="251234567890"
            />
          </AdminField>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Registration closes at" hint="Auto-close at this date/time. Leave blank for no deadline. If you reopen a camp after auto-close, clear or extend this — otherwise cron closes it again.">
          <input
            className={adminInputClass}
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={
              camp?.registrationClosesAt
                ? camp.registrationClosesAt.slice(0, 16)
                : ""
            }
          />
        </AdminField>
        <AdminField label="Auto-close at capacity">
          <label className="flex h-11 items-center gap-2 border border-line bg-paper px-3 text-sm text-ink">
            <input
              name="autoCloseAtCapacity"
              type="checkbox"
              defaultChecked={camp?.autoCloseAtCapacity ?? true}
            />
            Flip status to Full when capacity is reached
          </label>
        </AdminField>
      </div>

      <AdminField label="Internal notes" hint="Only visible in the admin. Helpful for handoff.">
        <textarea
          className={adminTextareaClass}
          name="notes"
          defaultValue={camp?.notes ?? ""}
          placeholder="Any internal context — staff list, payment account, etc."
        />
      </AdminField>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
        <AdminSubmitButton
          idleLabel={isEditing ? "Save changes" : "Create camp"}
          pendingLabel="Saving…"
          icon={<CheckCircle size={16} weight="bold" />}
        />
      </div>
    </form>
  );
}
