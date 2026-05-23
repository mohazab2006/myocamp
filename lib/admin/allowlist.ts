/**
 * Admin email allowlist. Sourced from `ADMIN_EMAILS` (comma-separated) or
 * `ADMIN_EMAIL` (single value) — both supported for back-compat.
 *
 * Only emails returned here may complete /admin sign-in. Anyone else (including
 * valid Supabase users not on the list) is rejected with a forbidden state.
 */
export function getAdminAllowlist() {
  return (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminAllowlist().includes(email.toLowerCase());
}
