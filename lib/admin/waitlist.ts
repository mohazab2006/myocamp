import "server-only";

import { randomBytes } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CamperInfo,
  WaitlistEntry,
  WaitlistEntryStatus
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Row → domain mapper
// ---------------------------------------------------------------------------

type WaitlistRow = {
  id: string;
  camp_id: string;
  jotform_submission_id: string | null;
  position: number | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  camper_name: string | null;
  raw_payload: Record<string, unknown> | null;
  status: WaitlistEntryStatus;
  promoted_at: string | null;
  claim_token: string | null;
  claim_expires_at: string | null;
  claimed_registration_id: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    campId: row.camp_id,
    jotformSubmissionId: row.jotform_submission_id,
    position: row.position,
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    camperName: row.camper_name,
    rawPayload: row.raw_payload ?? {},
    status: row.status,
    promotedAt: row.promoted_at,
    claimToken: row.claim_token,
    claimExpiresAt: row.claim_expires_at,
    claimedRegistrationId: row.claimed_registration_id,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function fetchWaitlistForCamp(campId: string): Promise<WaitlistEntry[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("*")
    .eq("camp_id", campId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("submitted_at", { ascending: true });
  if (error) {
    console.warn("fetchWaitlistForCamp failed:", error.message);
    return [];
  }
  return (data as WaitlistRow[]).map(rowToEntry);
}

export async function fetchWaitlistEntryById(id: string): Promise<WaitlistEntry | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToEntry(data as WaitlistRow);
}

export async function findWaitlistByClaimToken(token: string): Promise<WaitlistEntry | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("*")
    .eq("claim_token", token)
    .maybeSingle();
  if (error || !data) return null;
  return rowToEntry(data as WaitlistRow);
}

// ---------------------------------------------------------------------------
// Manual add (admin)
// ---------------------------------------------------------------------------

export interface CreateWaitlistInput {
  campId: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  camperName: string | null;
  rawPayload?: Record<string, unknown>;
}

export async function createWaitlistEntry(input: CreateWaitlistInput): Promise<WaitlistEntry> {
  const supabase = createSupabaseAdminClient();

  const { data: tail } = await supabase
    .from("waitlist_entries")
    .select("position")
    .eq("camp_id", input.campId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = ((tail as { position: number | null } | null)?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from("waitlist_entries")
    .insert({
      camp_id: input.campId,
      position: nextPosition,
      parent_name: input.parentName,
      parent_email: input.parentEmail,
      parent_phone: input.parentPhone,
      camper_name: input.camperName,
      raw_payload: input.rawPayload ?? { _manualEntry: true }
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToEntry(data as WaitlistRow);
}

// ---------------------------------------------------------------------------
// Promote (admin → email parent a claim link)
// ---------------------------------------------------------------------------

const CLAIM_TTL_HOURS_DEFAULT = 48;

function generateClaimToken(): string {
  return randomBytes(24).toString("hex"); // 48 hex chars
}

export async function promoteWaitlistEntry(
  id: string,
  options?: { ttlHours?: number }
): Promise<WaitlistEntry> {
  const supabase = createSupabaseAdminClient();
  const token = generateClaimToken();
  const ttlMs = (options?.ttlHours ?? CLAIM_TTL_HOURS_DEFAULT) * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const { data, error } = await supabase
    .from("waitlist_entries")
    .update({
      status: "promoted",
      promoted_at: new Date().toISOString(),
      claim_token: token,
      claim_expires_at: expiresAt
    })
    .eq("id", id)
    .eq("status", "active") // only promote active entries
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Entry not found or already promoted.");
  return rowToEntry(data as WaitlistRow);
}

export async function unpromoteWaitlistEntry(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("waitlist_entries")
    .update({
      status: "active",
      promoted_at: null,
      claim_token: null,
      claim_expires_at: null
    })
    .eq("id", id)
    .eq("status", "promoted");
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Remove / reorder
// ---------------------------------------------------------------------------

export async function removeWaitlistEntry(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("waitlist_entries")
    .update({ status: "removed" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reactivateWaitlistEntry(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("waitlist_entries")
    .update({
      status: "active",
      promoted_at: null,
      claim_token: null,
      claim_expires_at: null
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function moveWaitlistPosition(id: string, direction: "up" | "down"): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error: rowErr } = await supabase
    .from("waitlist_entries")
    .select("camp_id, position, status")
    .eq("id", id)
    .maybeSingle();
  if (rowErr || !row) throw new Error("Entry not found.");
  const r = row as { camp_id: string; position: number | null; status: WaitlistEntryStatus };
  if (r.position == null) throw new Error("Entry has no position.");
  if (r.status !== "active") throw new Error("Only active entries can be reordered.");

  const swapWith = direction === "up"
    ? await supabase
        .from("waitlist_entries")
        .select("id, position")
        .eq("camp_id", r.camp_id)
        .eq("status", "active")
        .lt("position", r.position)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle()
    : await supabase
        .from("waitlist_entries")
        .select("id, position")
        .eq("camp_id", r.camp_id)
        .eq("status", "active")
        .gt("position", r.position)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();

  if (swapWith.error || !swapWith.data) return; // nothing to swap with (already at edge)
  const other = swapWith.data as { id: string; position: number };

  await supabase.from("waitlist_entries").update({ position: other.position }).eq("id", id);
  await supabase.from("waitlist_entries").update({ position: r.position }).eq("id", other.id);
}

// ---------------------------------------------------------------------------
// Expiry sweep — called by cron and the admin "expire now" action.
// ---------------------------------------------------------------------------

export async function expireOverdueClaims(): Promise<{ expired: number }> {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .update({ status: "expired" })
    .eq("status", "promoted")
    .lt("claim_expires_at", nowIso)
    .select("id");
  if (error) throw new Error(error.message);
  return { expired: (data ?? []).length };
}

// ---------------------------------------------------------------------------
// Claim acceptance — parent visited the claim link and accepted
// ---------------------------------------------------------------------------

export interface ClaimAcceptanceInput {
  token: string;
  // Optional overrides if the parent supplies different info than what we have:
  campers?: CamperInfo[];
  notes?: string | null;
}

/**
 * Mark a promoted waitlist entry as `claimed` and record the linked
 * registration. The actual registration + invoice rows are created by the
 * caller (so the route handler can build the right amounts via fetchCampBySlug
 * etc).
 */
export async function markWaitlistClaimed(
  id: string,
  registrationId: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("waitlist_entries")
    .update({
      status: "claimed",
      claimed_registration_id: registrationId,
      // Invalidate the token so the same link can't be re-used to make a second registration.
      claim_token: null
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Build claim URL (for emails + admin display)
// ---------------------------------------------------------------------------

export function buildClaimUrl(
  campSlug: string,
  token: string,
  origin?: string | null
): string {
  const base = origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://myo.camp";
  return `${base.replace(/\/$/, "")}/camp/${encodeURIComponent(campSlug)}/claim/${encodeURIComponent(token)}`;
}
