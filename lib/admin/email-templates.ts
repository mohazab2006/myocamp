import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type EmailTemplateSlug =
  | "registration_received"
  | "invoice_reminder"
  | "waitlist_promoted"
  | "payment_confirmation";

export interface EmailTemplate {
  slug: EmailTemplateSlug;
  label: string;
  description: string | null;
  subject: string;
  bodyMarkdown: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

type Row = {
  slug: EmailTemplateSlug;
  label: string;
  description: string | null;
  subject: string;
  body_markdown: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

function rowToTemplate(row: Row): EmailTemplate {
  return {
    slug: row.slug,
    label: row.label,
    description: row.description,
    subject: row.subject,
    bodyMarkdown: row.body_markdown,
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const TEMPLATE_PLACEHOLDERS: Record<EmailTemplateSlug, string[]> = {
  registration_received: [
    "parent_name",
    "camper_name",
    "camp_title",
    "camp_dates",
    "ref",
    "amount",
    "payment_url"
  ],
  invoice_reminder: [
    "parent_name",
    "camper_name",
    "camp_title",
    "camp_dates",
    "ref",
    "amount",
    "payment_url",
    "days_until_camp"
  ],
  waitlist_promoted: [
    "parent_name",
    "camper_name",
    "camp_title",
    "camp_dates",
    "claim_url",
    "claim_window"
  ],
  payment_confirmation: [
    "parent_name",
    "camper_name",
    "camp_title",
    "camp_dates",
    "ref",
    "amount_paid",
    "payment_method"
  ]
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("slug", { ascending: true });
  if (error) {
    console.warn("fetchEmailTemplates failed:", error.message);
    return [];
  }
  return (data as Row[]).map(rowToTemplate);
}

export async function fetchEmailTemplate(slug: EmailTemplateSlug): Promise<EmailTemplate | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return rowToTemplate(data as Row);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export interface UpdateEmailTemplateInput {
  subject: string;
  bodyMarkdown: string;
  enabled: boolean;
}

export async function updateEmailTemplate(
  slug: EmailTemplateSlug,
  patch: UpdateEmailTemplateInput
): Promise<EmailTemplate> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .update({
      subject: patch.subject,
      body_markdown: patch.bodyMarkdown,
      enabled: patch.enabled
    })
    .eq("slug", slug)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToTemplate(data as Row);
}
