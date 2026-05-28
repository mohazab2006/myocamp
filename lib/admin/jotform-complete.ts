import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchRegistrationById,
  findRegistrationByJotformSubmission
} from "@/lib/admin/registrations";
import type { Camp, Invoice, Registration } from "@/lib/types";

export type JotformSubmissionOutcome =
  | {
      kind: "registration";
      camp: Pick<Camp, "slug" | "title">;
      registration: Registration;
      invoice: Invoice;
    }
  | {
      kind: "waitlist";
      camp: Pick<Camp, "slug" | "title">;
      position: number;
    };

/** Resolve a JotForm submission id to registration or waitlist outcome (after webhook runs). */
export async function lookupJotformSubmissionOutcome(
  submissionId: string
): Promise<JotformSubmissionOutcome | null> {
  const sid = submissionId.trim();
  if (!sid) return null;

  const registration = await findRegistrationByJotformSubmission(sid);
  if (registration) {
    const full = await fetchRegistrationById(registration.id);
    if (!full?.invoice) return null;

    const supabase = createSupabaseAdminClient();
    const { data: campRow } = await supabase
      .from("camps")
      .select("slug, title")
      .eq("id", registration.campId)
      .maybeSingle();

    if (!campRow) return null;

    return {
      kind: "registration",
      camp: campRow as Pick<Camp, "slug" | "title">,
      registration: full.registration,
      invoice: full.invoice
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: wlRow } = await supabase
    .from("waitlist_entries")
    .select("position, camps ( slug, title )")
    .eq("jotform_submission_id", sid)
    .maybeSingle();

  if (wlRow) {
    const campRaw = (wlRow as { camps: Pick<Camp, "slug" | "title"> | Pick<Camp, "slug" | "title">[] | null })
      .camps;
    const camp = Array.isArray(campRaw) ? campRaw[0] : campRaw;
    if (!camp) return null;
    return {
      kind: "waitlist",
      camp,
      position: (wlRow as { position: number }).position
    };
  }

  return null;
}
