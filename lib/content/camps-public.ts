import "server-only";

import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { countActiveCampers } from "@/lib/admin/camp-capacity";
import { parseCampData } from "@/lib/admin/camp-data";
import { getCampSettings } from "@/lib/content/camp";
import type { Camp, CampStatus } from "@/lib/types";

export type PublicRegistrationStatus = "open" | "full" | "closed" | "opening-soon";

export interface PublicCamp {
  id: string;
  slug: string;
  title: string;
  status: CampStatus;
  registrationStatus: PublicRegistrationStatus;
  capacity: number | null;
  startDate: string;
  endDate: string;
  location: string | null;
  feePerCamper: number;
  paymentEmail: string;
  registrationFormJotformId: string | null;
  waitlistFormJotformId: string | null;
  registrationClosesAt: string | null;
  registerPath: string;
  heroImage: string | null;
  featuredOnEvents: boolean;
  /** Active camper slots (filled at read time for public pages). */
  activeCamperCount: number;
}

type CampRow = {
  id: string;
  slug: string;
  title: string;
  status: CampStatus;
  capacity: number | null;
  start_date: string;
  end_date: string;
  location: string | null;
  fee_per_camper: number | string;
  registration_form_jotform_id: string | null;
  waitlist_form_jotform_id: string | null;
  registration_closes_at: string | null;
  data: Record<string, unknown> | null;
};

function mapStatus(status: CampStatus, activeCamperCount: number, capacity: number | null): PublicRegistrationStatus {
  switch (status) {
    case "open":
      return "open";
    case "full":
      return "full";
    case "closed":
      if (capacity != null && capacity > 0 && activeCamperCount >= capacity) {
        return "full";
      }
      return "closed";
    case "archived":
      return "closed";
    case "draft":
    default:
      return "opening-soon";
  }
}

/** True when every spot is taken (or admin marked the camp Full). */
export function isCampAtCapacity(camp: Pick<PublicCamp, "status" | "capacity" | "activeCamperCount">): boolean {
  if (camp.status === "full") return true;
  return camp.capacity != null && camp.capacity > 0 && camp.activeCamperCount >= camp.capacity;
}

function resolvePaymentEmail(data: Record<string, unknown> | null): string {
  const fromData =
    data && typeof data.paymentEmail === "string" && data.paymentEmail.trim()
      ? data.paymentEmail.trim()
      : null;
  if (fromData) return fromData;
  return process.env.PAYMENT_EMAIL ?? process.env.NEXT_PUBLIC_PAYMENT_EMAIL ?? "myoadmin@gmail.com";
}

function rowToPublicCamp(row: CampRow, activeCamperCount = 0): PublicCamp {
  const data = parseCampData(row.data);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    registrationStatus: mapStatus(row.status, activeCamperCount, row.capacity),
    capacity: row.capacity,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    feePerCamper: Number(row.fee_per_camper),
    paymentEmail: resolvePaymentEmail(row.data),
    registrationFormJotformId: row.registration_form_jotform_id,
    waitlistFormJotformId: row.waitlist_form_jotform_id,
    registrationClosesAt: row.registration_closes_at,
    registerPath: `/camp/${row.slug}/register`,
    heroImage: data.heroImage,
    featuredOnEvents: data.featuredOnEvents,
    activeCamperCount
  };
}

async function enrichPublicCamps(rows: CampRow[]): Promise<PublicCamp[]> {
  const counts = await Promise.all(rows.map((row) => countActiveCampers(row.id)));
  return rows.map((row, index) => rowToPublicCamp(row, counts[index] ?? 0));
}

function isPubliclyJoinable(camp: PublicCamp): boolean {
  if (camp.status === "open" || camp.status === "full") return true;
  if (camp.status === "closed" && isCampAtCapacity(camp) && camp.waitlistFormJotformId) {
    return true;
  }
  return false;
}

export async function fetchPublicCampBySlug(slug: string): Promise<PublicCamp | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("camps")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as CampRow;
  if (row.status === "archived") return null;
  const count = await countActiveCampers(row.id);
  return rowToPublicCamp(row, count);
}

/**
 * Camps parents can register or waitlist for (open, full, or closed-but-at-capacity).
 */
export async function fetchRegisterablePublicCamps(): Promise<PublicCamp[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("camps")
    .select("*")
    .in("status", ["open", "full", "closed"])
    .order("start_date", { ascending: true });

  if (error || !data) return [];
  const camps = await enrichPublicCamps(data as CampRow[]);
  return camps.filter(isPubliclyJoinable);
}

/**
 * The camp parents should register for — featured camp first, else earliest open/full session.
 */
export async function fetchPrimaryPublicCamp(): Promise<PublicCamp | null> {
  const camps = await fetchRegisterablePublicCamps();
  return camps.find((c) => c.featuredOnEvents) ?? camps[0] ?? null;
}

/** Camps marked featured on the events page (non-archived, ordered by start date). */
export async function fetchFeaturedPublicCamps(): Promise<PublicCamp[]> {
  const camps = await fetchPublicCampsIndex();
  return camps.filter((c) => c.featuredOnEvents);
}

/** All non-archived camps for event linking and lookups. */
export async function fetchPublicCampsIndex(): Promise<PublicCamp[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("camps")
    .select("*")
    .neq("status", "archived")
    .order("start_date", { ascending: true });

  if (error || !data) return [];
  return enrichPublicCamps(data as CampRow[]);
}

/** Merge legacy seed settings with the primary Supabase camp for marketing pages. */
export async function getPublicCampContext(): Promise<{
  legacy: Awaited<ReturnType<typeof getCampSettings>>;
  primary: PublicCamp | null;
}> {
  const [legacy, primary] = await Promise.all([getCampSettings(), fetchPrimaryPublicCamp()]);
  return { legacy, primary };
}

export function jotformEmbedUrl(formId: string, parentUrl?: string): string {
  const base = `https://form.jotform.com/${formId}`;
  const params = new URLSearchParams({ jsForm: "true" });
  if (parentUrl) params.set("parentURL", parentUrl);
  return `${base}?${params.toString()}`;
}

/** JotForm thank-you redirect — paste in JotForm Settings → Thank You Page. Keep `{id}` literal. */
export function jotformThankYouRedirectUrl(siteOrigin: string, _campSlug?: string): string {
  return `${siteOrigin.replace(/\/$/, "")}/camp/register/complete?sid={id}`;
}

export function activeFormForCamp(camp: PublicCamp): {
  formId: string | null;
  mode: "registration" | "waitlist" | "none";
} {
  if (camp.status === "open" && camp.registrationFormJotformId) {
    return { formId: camp.registrationFormJotformId, mode: "registration" };
  }
  if (isCampAtCapacity(camp) && camp.waitlistFormJotformId) {
    return { formId: camp.waitlistFormJotformId, mode: "waitlist" };
  }
  return { formId: null, mode: "none" };
}

/** Map admin Camp (without data join) + optional payment email override. */
export function campToPublicShape(camp: Camp, paymentEmail?: string | null): PublicCamp {
  return {
    id: camp.id,
    slug: camp.slug,
    title: camp.title,
    status: camp.status,
    registrationStatus: mapStatus(camp.status, 0, camp.capacity),
    capacity: camp.capacity,
    startDate: camp.startDate,
    endDate: camp.endDate,
    location: camp.location,
    feePerCamper: camp.feePerCamper,
    paymentEmail:
      paymentEmail ??
      camp.paymentEmail ??
      process.env.PAYMENT_EMAIL ??
      "myoadmin@gmail.com",
    registrationFormJotformId: camp.registrationFormJotformId,
    waitlistFormJotformId: camp.waitlistFormJotformId,
    registrationClosesAt: camp.registrationClosesAt,
    registerPath: `/camp/${camp.slug}/register`,
    heroImage: camp.heroImage,
    featuredOnEvents: camp.featuredOnEvents,
    activeCamperCount: 0
  };
}
