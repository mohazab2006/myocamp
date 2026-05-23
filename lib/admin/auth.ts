import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

import { isAllowedAdminEmail } from "@/lib/admin/allowlist";

function getSupabaseAuthKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseAuthEnv() {
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

export type AdminSession =
  | { status: "unconfigured"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "forbidden"; user: User }
  | { status: "authorized"; user: User };

/**
 * Resolve the current admin session from the request cookies + env. Branches:
 *  - `unconfigured` → Supabase env vars missing entirely.
 *  - `anonymous` → no Supabase session.
 *  - `forbidden` → signed in to Supabase but email not on ADMIN_EMAILS.
 *  - `authorized` → signed in AND on the allowlist (full admin access).
 */
export async function getAdminSession(): Promise<AdminSession> {
  if (!hasSupabaseAuthEnv()) {
    return { status: "unconfigured", user: null };
  }

  const supabase = await createSupabaseAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "anonymous", user: null };
  }

  if (!isAllowedAdminEmail(user.email)) {
    return { status: "forbidden", user };
  }

  return { status: "authorized", user };
}

/**
 * Back-compat helper: returns the User only if authorized, else null.
 * Kept so existing server actions (`requireAdmin`) don't break.
 */
export async function getAdminUser() {
  const session = await getAdminSession();
  return session.status === "authorized" ? session.user : null;
}

/** Back-compat alias. */
export const isSupabaseAuthConfigured = hasSupabaseAuthEnv;
