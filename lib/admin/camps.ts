import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mergeCampData, parseCampData } from "@/lib/admin/camp-data";
import { reconcileOrphanedInboundMatches } from "@/lib/admin/inbound-emails";
import { slugifyCampTitle } from "@/lib/slug";
import type { Camp, CampStats, CampStatus } from "@/lib/types";

type CampRow = {
  id: string;
  slug: string;
  title: string;
  status: Camp["status"];
  capacity: number | null;
  start_date: string;
  end_date: string;
  location: string | null;
  fee_per_camper: string | number;
  registration_form_jotform_id: string | null;
  waitlist_form_jotform_id: string | null;
  registration_closes_at: string | null;
  auto_close_at_capacity: boolean;
  notes: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function rowToCamp(row: CampRow): Camp {
  const data = parseCampData(row.data);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    capacity: row.capacity,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    feePerCamper: Number(row.fee_per_camper),
    registrationFormJotformId: row.registration_form_jotform_id,
    waitlistFormJotformId: row.waitlist_form_jotform_id,
    registrationClosesAt: row.registration_closes_at,
    autoCloseAtCapacity: row.auto_close_at_capacity,
    paymentEmail: data.paymentEmail,
    heroImage: data.heroImage,
    featuredOnEvents: data.featuredOnEvents,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function fetchCamps(): Promise<Camp[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("camps")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.warn("fetchCamps failed:", error.message);
    return [];
  }
  return (data as CampRow[]).map(rowToCamp);
}

/** Non-archived camps for event linking dropdowns. */
export async function fetchCampsForEventLink(): Promise<Camp[]> {
  const camps = await fetchCamps();
  return camps.filter((c) => c.status !== "archived");
}

export async function fetchCampBySlug(slug: string): Promise<Camp | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("camps")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return rowToCamp(data as CampRow);
}

export type UpsertCampInput = {
  slug: string;
  title: string;
  status: Camp["status"];
  capacity: number | null;
  startDate: string;
  endDate: string;
  location: string | null;
  feePerCamper: number;
  registrationFormJotformId: string | null;
  waitlistFormJotformId: string | null;
  registrationClosesAt: string | null;
  autoCloseAtCapacity: boolean;
  paymentEmail: string | null;
  heroImage: string | null;
  featuredOnEvents: boolean;
  notes: string | null;
};

function campDataFromInput(input: UpsertCampInput) {
  return {
    paymentEmail: input.paymentEmail,
    heroImage: input.heroImage,
    featuredOnEvents: input.featuredOnEvents
  };
}

function shouldAutoFeatureOnOpen(
  previousStatus: CampStatus | null | undefined,
  newStatus: CampStatus
): boolean {
  return newStatus === "open" && previousStatus !== "open";
}

function withAutoFeatureOnOpen(
  input: UpsertCampInput,
  previousStatus?: CampStatus | null
): UpsertCampInput {
  if (!shouldAutoFeatureOnOpen(previousStatus, input.status)) return input;
  return { ...input, featuredOnEvents: true };
}

/** Feature on /events when a camp newly opens (only one featured at a time). */
export async function autoFeatureCampIfOpen(
  campId: string,
  previousStatus: CampStatus,
  newStatus: CampStatus
): Promise<void> {
  if (!shouldAutoFeatureOnOpen(previousStatus, newStatus)) return;

  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("camps")
    .select("data")
    .eq("id", campId)
    .maybeSingle();
  if (error || !row) return;

  const existingData = (row.data as Record<string, unknown> | null) ?? null;
  const parsed = parseCampData(existingData);
  const merged = mergeCampData(existingData, { ...parsed, featuredOnEvents: true });

  await supabase.from("camps").update({ data: merged }).eq("id", campId);
  await clearOtherFeaturedCamps(campId);
}

async function clearOtherFeaturedCamps(exceptId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("camps").select("id, data");
  if (error || !data) return;

  for (const row of data as Array<{ id: string; data: Record<string, unknown> | null }>) {
    if (row.id === exceptId) continue;
    if (row.data?.featuredOnEvents !== true) continue;
    const next = { ...row.data };
    delete next.featuredOnEvents;
    await supabase.from("camps").update({ data: next }).eq("id", row.id);
  }
}

async function ensureUniqueCampSlug(base: string, exceptId?: string): Promise<string> {
  let candidate = slugifyCampTitle(base) || "camp";
  let suffix = 2;

  while (true) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("camps")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data || (exceptId && (data as { id: string }).id === exceptId)) {
      return candidate;
    }

    candidate = `${slugifyCampTitle(base).slice(0, 72)}-${suffix}`;
    suffix++;
  }
}

export async function createCamp(input: UpsertCampInput): Promise<Camp> {
  const supabase = createSupabaseAdminClient();
  const slug = await ensureUniqueCampSlug(input.slug);
  const effective = withAutoFeatureOnOpen(input, null);
  const { data, error } = await supabase
    .from("camps")
    .insert({
      slug,
      title: effective.title,
      status: effective.status,
      capacity: effective.capacity,
      start_date: effective.startDate,
      end_date: effective.endDate,
      location: effective.location,
      fee_per_camper: effective.feePerCamper,
      registration_form_jotform_id: effective.registrationFormJotformId,
      waitlist_form_jotform_id: effective.waitlistFormJotformId,
      registration_closes_at: effective.registrationClosesAt,
      auto_close_at_capacity: effective.autoCloseAtCapacity,
      notes: effective.notes,
      data: mergeCampData(null, campDataFromInput(effective))
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const camp = rowToCamp(data as CampRow);

  if (effective.featuredOnEvents) {
    await clearOtherFeaturedCamps(camp.id);
  }

  return camp;
}

export async function updateCamp(id: string, input: UpsertCampInput): Promise<Camp> {
  const supabase = createSupabaseAdminClient();
  const slug = await ensureUniqueCampSlug(input.slug, id);

  const { data: existing, error: readErr } = await supabase
    .from("camps")
    .select("data, status")
    .eq("id", id)
    .maybeSingle();

  if (readErr) throw new Error(readErr.message);

  const previousStatus = (existing?.status as CampStatus | undefined) ?? null;
  const effective = withAutoFeatureOnOpen(input, previousStatus);

  const { data, error } = await supabase
    .from("camps")
    .update({
      slug,
      title: effective.title,
      status: effective.status,
      capacity: effective.capacity,
      start_date: effective.startDate,
      end_date: effective.endDate,
      location: effective.location,
      fee_per_camper: effective.feePerCamper,
      registration_form_jotform_id: effective.registrationFormJotformId,
      waitlist_form_jotform_id: effective.waitlistFormJotformId,
      registration_closes_at: effective.registrationClosesAt,
      auto_close_at_capacity: effective.autoCloseAtCapacity,
      notes: effective.notes,
      data: mergeCampData(
        (existing?.data as Record<string, unknown> | null) ?? null,
        campDataFromInput(effective)
      )
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const camp = rowToCamp(data as CampRow);

  if (effective.featuredOnEvents) {
    await clearOtherFeaturedCamps(camp.id);
  }

  return camp;
}

export async function archiveCamp(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("camps").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCampHard(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: regRows } = await supabase
    .from("registrations")
    .select("invoices ( id )")
    .eq("camp_id", id);

  const invoiceIds: string[] = [];
  for (const reg of (regRows ?? []) as Array<{ invoices: { id: string }[] | { id: string } | null }>) {
    const inv = reg.invoices;
    if (Array.isArray(inv)) {
      for (const i of inv) if (i?.id) invoiceIds.push(i.id);
    } else if (inv?.id) {
      invoiceIds.push(inv.id);
    }
  }

  if (invoiceIds.length > 0) {
    const { data: payRows } = await supabase
      .from("payments")
      .select("id")
      .in("invoice_id", invoiceIds);

    const paymentIds = (payRows ?? []).map((p: { id: string }) => p.id);
    if (paymentIds.length > 0) {
      await supabase
        .from("inbound_emails")
        .update({
          match_status: "not_payment",
          matched_payment_id: null,
          error_message: "Linked camp was deleted.",
          processed_at: new Date().toISOString()
        })
        .eq("match_status", "matched")
        .in("matched_payment_id", paymentIds);
    }
  }

  const { error } = await supabase.from("camps").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await reconcileOrphanedInboundMatches();
}

/**
 * Aggregate stats per camp — counts + totals. Single query for the overview
 * cards. Returns a map keyed by camp_id.
 */
export async function fetchCampStats(campIds: string[]): Promise<Record<string, CampStats>> {
  const result: Record<string, CampStats> = {};
  if (campIds.length === 0) return result;
  for (const id of campIds) {
    result[id] = {
      registeredCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      collected: 0,
      outstanding: 0,
      waitlistCount: 0
    };
  }

  const supabase = createSupabaseAdminClient();

  // Registrations + invoices in one shot, joined.
  const { data: regRows, error: regErr } = await supabase
    .from("registrations")
    .select("camp_id, status, invoices ( amount_due, amount_paid, status )")
    .in("camp_id", campIds)
    .eq("status", "active");

  if (regErr) {
    console.warn("fetchCampStats(registrations) failed:", regErr.message);
  } else if (regRows) {
    for (const row of regRows as Array<{
      camp_id: string;
      status: string;
      invoices: Array<{ amount_due: number | string; amount_paid: number | string; status: string }>;
    }>) {
      const stats = result[row.camp_id];
      if (!stats) continue;
      stats.registeredCount += 1;
      const invoice = row.invoices?.[0];
      if (!invoice) {
        stats.unpaidCount += 1;
        continue;
      }
      const due = Number(invoice.amount_due);
      const paid = Number(invoice.amount_paid);
      stats.collected += paid;
      stats.outstanding += Math.max(0, due - paid);
      if (invoice.status === "paid") stats.paidCount += 1;
      else stats.unpaidCount += 1;
    }
  }

  const { data: wlRows, error: wlErr } = await supabase
    .from("waitlist_entries")
    .select("camp_id")
    .in("camp_id", campIds)
    .eq("status", "active");

  if (wlErr) {
    console.warn("fetchCampStats(waitlist) failed:", wlErr.message);
  } else if (wlRows) {
    for (const row of wlRows as Array<{ camp_id: string }>) {
      const stats = result[row.camp_id];
      if (stats) stats.waitlistCount += 1;
    }
  }

  return result;
}
