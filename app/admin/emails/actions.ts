"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import {
  fetchEmailTemplate,
  updateEmailTemplate,
  type EmailTemplateSlug
} from "@/lib/admin/email-templates";

const VALID_SLUGS: EmailTemplateSlug[] = [
  "registration_received",
  "payment_followup",
  "invoice_reminder",
  "waitlist_promoted",
  "payment_confirmation"
];

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

export async function saveEmailTemplateAction(formData: FormData) {
  await requireAuthorizedAdmin();

  const slugRaw = value(formData, "slug");
  if (!VALID_SLUGS.includes(slugRaw as EmailTemplateSlug)) {
    flash("/admin/emails", "error", "Unknown template slug.");
  }
  const slug = slugRaw as EmailTemplateSlug;
  const subject = value(formData, "subject");
  const bodyMarkdown = String(formData.get("bodyMarkdown") ?? "");
  const enabled = formData.get("enabled") === "on";

  if (!subject) flash(`/admin/emails/${slug}`, "error", "Subject is required.");
  if (!bodyMarkdown.trim()) {
    flash(`/admin/emails/${slug}`, "error", "Body is required.");
  }

  const existing = await fetchEmailTemplate(slug);
  if (!existing) flash("/admin/emails", "error", "Template not found.");

  try {
    await updateEmailTemplate(slug, {
      subject,
      bodyMarkdown,
      enabled
    });
  } catch (err) {
    flash(
      `/admin/emails/${slug}`,
      "error",
      err instanceof Error ? err.message : "Could not save template."
    );
  }

  revalidatePath(`/admin/emails`);
  revalidatePath(`/admin/emails/${slug}`);
  flash(`/admin/emails/${slug}`, "success", "Template saved.");
}
