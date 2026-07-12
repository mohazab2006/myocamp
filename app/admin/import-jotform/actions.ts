"use server";

import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { fetchCampBySlug } from "@/lib/admin/camps";
import { parseJotformWebhook } from "@/lib/admin/jotform";
import { createRegistrationWithInvoice } from "@/lib/admin/registrations";
import { loadRegistrationContextByInvoice, notify } from "@/lib/email/notifications";
import { buildAdminRedirect } from "@/lib/admin/page-state";

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  emailsSent: number;
  errors: string[];
  previews: Array<{ name: string | null; email: string | null; ref: string }>;
}

type JotformAnswer = {
  name: string;
  answer: unknown;
};

type JotformSubmission = {
  id: string;
  form_id: string;
  status: string;
  answers: Record<string, JotformAnswer>;
};

async function fetchAllSubmissions(
  formId: string,
  apiKey: string
): Promise<JotformSubmission[]> {
  const url = `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}&limit=1000&orderby=created_at`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`JotForm API error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { responseCode: number; message?: string; content: JotformSubmission[] };
  if (json.responseCode !== 200) throw new Error(`JotForm: ${json.message ?? "unknown error"}`);
  return json.content ?? [];
}

function submissionToWebhookBody(sub: JotformSubmission): Record<string, string> {
  const rawRequest: Record<string, unknown> = {};
  for (const field of Object.values(sub.answers)) {
    if (field.name && field.answer != null) {
      rawRequest[field.name] = field.answer;
    }
  }
  return {
    formID: sub.form_id,
    submissionID: sub.id,
    rawRequest: JSON.stringify(rawRequest)
  };
}

export async function importJotformSubmissionsAction(
  formData: FormData
): Promise<ImportResult> {
  await requireAuthorizedAdmin();

  const campSlug = String(formData.get("campSlug") ?? "").trim();
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const sendEmails = formData.get("sendEmails") === "1";

  if (!campSlug || !apiKey) {
    return { total: 0, imported: 0, skipped: 0, emailsSent: 0, errors: ["Missing camp slug or API key."], previews: [] };
  }

  const camp = await fetchCampBySlug(campSlug);
  if (!camp) {
    return { total: 0, imported: 0, skipped: 0, emailsSent: 0, errors: [`Camp "${campSlug}" not found.`], previews: [] };
  }
  if (!camp.registrationFormJotformId) {
    return { total: 0, imported: 0, skipped: 0, emailsSent: 0, errors: ["This camp has no JotForm registration form ID set. Add it in camp settings first."], previews: [] };
  }

  let submissions: JotformSubmission[];
  try {
    submissions = await fetchAllSubmissions(camp.registrationFormJotformId, apiKey);
  } catch (err) {
    return { total: 0, imported: 0, skipped: 0, emailsSent: 0, errors: [err instanceof Error ? err.message : "Failed to fetch from JotForm."], previews: [] };
  }

  const active = submissions.filter((s) => s.status !== "DELETED");
  const campStartYear = new Date(camp.startDate).getUTCFullYear();

  let imported = 0;
  let skipped = 0;
  let emailsSent = 0;
  const errors: string[] = [];
  const previews: ImportResult["previews"] = [];

  for (const sub of active) {
    try {
      const body = submissionToWebhookBody(sub);
      const parsed = parseJotformWebhook(body);

      const result = await createRegistrationWithInvoice({
        campId: camp.id,
        campStartYear,
        feePerCamper: camp.feePerCamper,
        source: "jotform",
        jotformSubmissionId: parsed.submissionId || null,
        parentName: parsed.parentName,
        parentEmail: parsed.parentEmail,
        parentPhone: parsed.parentPhone,
        campers: parsed.campers,
        rawPayload: parsed.rawPayload
      });

      if (result.isNew) {
        imported++;
        previews.push({
          name: result.registration.parentName,
          email: result.registration.parentEmail,
          ref: result.invoice.referenceCode
        });

        if (sendEmails && result.registration.parentEmail) {
          try {
            const ctx = await loadRegistrationContextByInvoice(result.invoice.id);
            if (ctx) {
              await notify.registrationReceived(ctx);
              emailsSent++;
            }
          } catch (emailErr) {
            errors.push(`Email failed for ${result.registration.parentEmail}: ${emailErr instanceof Error ? emailErr.message : "unknown"}`);
          }
        }
      } else {
        skipped++;
      }
    } catch (err) {
      errors.push(`Submission ${sub.id}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return { total: active.length, imported, skipped, emailsSent, errors, previews };
}
