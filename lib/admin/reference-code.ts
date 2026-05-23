import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L confusables

function randomCode(length = 4) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a unique invoice reference code shaped like `MYO-2026-A4F2`.
 * Retries on collision (extremely rare — 31^4 = ~923k combos per year).
 */
export async function generateUniqueReferenceCode(year: number): Promise<string> {
  const supabase = createSupabaseAdminClient();

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `MYO-${year}-${randomCode(attempt < 4 ? 4 : 5)}`;
    const { data, error } = await supabase
      .from("invoices")
      .select("id")
      .eq("reference_code", code)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not check reference code uniqueness: ${error.message}`);
    }
    if (!data) return code;
  }
  throw new Error("Could not generate a unique reference code after 8 attempts.");
}
