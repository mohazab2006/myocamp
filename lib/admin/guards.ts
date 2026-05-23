import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession, hasSupabaseAuthEnv } from "@/lib/admin/auth";
import { buildAdminRedirect } from "@/lib/admin/page-state";

/**
 * Guard sub-pages under /admin. Redirects to /admin with a flash message
 * unless the user is fully authorized. Returns the User on success.
 */
export async function requireAuthorizedAdmin(redirectPath = "/admin") {
  const session = await getAdminSession();

  if (!hasSupabaseAuthEnv() || session.status === "unconfigured") {
    redirect(
      buildAdminRedirect(
        redirectPath,
        "error",
        "Supabase isn't configured. Set the required environment variables."
      )
    );
  }

  if (session.status === "anonymous") {
    redirect(buildAdminRedirect(redirectPath, "info", "Please sign in to continue."));
  }

  if (session.status === "forbidden") {
    redirect(
      buildAdminRedirect(redirectPath, "error", "This email isn't on the admin allowlist.")
    );
  }

  return session.user;
}
