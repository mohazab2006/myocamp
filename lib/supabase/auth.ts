import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseAuthKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseAuthConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseAuthKey());
}

export async function createSupabaseAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseAuthKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase Auth is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Server Actions can, and use the same helper.
        }
      }
    }
  });
}

export async function getAdminUser() {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = await createSupabaseAuthClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  const allowedEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
    return null;
  }

  return user;
}
