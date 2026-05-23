import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Camp, CampStatus } from "@/lib/types";

type RegistrationRow = {
  campers: unknown;
};

/**
 * Count active camper slots for a camp (sum of campers[] lengths on active registrations).
 */
export async function countActiveCampers(campId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("campers")
    .eq("camp_id", campId)
    .eq("status", "active");

  if (error || !data) return 0;

  let total = 0;
  for (const row of data as RegistrationRow[]) {
    const campers = row.campers;
    if (Array.isArray(campers) && campers.length > 0) {
      total += campers.length;
    } else {
      total += 1;
    }
  }
  return total;
}

export interface CapacitySyncResult {
  previousStatus: CampStatus;
  newStatus: CampStatus;
  camperCount: number;
  changed: boolean;
}

/**
 * Reconcile camp.status against capacity + auto_close_at_capacity.
 *   open  → full  when camper count ≥ capacity
 *   full  → open  when camper count < capacity (spot freed)
 */
export async function syncCampCapacityStatus(campId: string): Promise<CapacitySyncResult | null> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("camps")
    .select("status, capacity, auto_close_at_capacity")
    .eq("id", campId)
    .maybeSingle();

  if (error || !row) return null;

  const camp = row as {
    status: CampStatus;
    capacity: number | null;
    auto_close_at_capacity: boolean;
  };

  if (!camp.auto_close_at_capacity || camp.capacity == null || camp.capacity <= 0) {
    return {
      previousStatus: camp.status,
      newStatus: camp.status,
      camperCount: await countActiveCampers(campId),
      changed: false
    };
  }

  const camperCount = await countActiveCampers(campId);
  let newStatus = camp.status;

  if (camp.status === "open" && camperCount >= camp.capacity) {
    newStatus = "full";
  } else if (camp.status === "full" && camperCount < camp.capacity) {
    newStatus = "open";
  }

  if (newStatus !== camp.status) {
    await supabase.from("camps").update({ status: newStatus }).eq("id", campId);
  }

  return {
    previousStatus: camp.status,
    newStatus,
    camperCount,
    changed: newStatus !== camp.status
  };
}

/**
 * Close camps whose registration_closes_at deadline has passed.
 * Returns the number of camps flipped to closed.
 */
export async function closeOverdueRegistrations(): Promise<{ closed: number }> {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("camps")
    .update({ status: "closed" })
    .eq("status", "open")
    .not("registration_closes_at", "is", null)
    .lt("registration_closes_at", nowIso)
    .select("id");

  if (error) throw new Error(error.message);
  return { closed: (data ?? []).length };
}
