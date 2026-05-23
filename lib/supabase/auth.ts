// Re-exports kept for back-compat. New code should import from `@/lib/admin/auth`.
export {
  createSupabaseAuthClient,
  getAdminUser,
  hasSupabaseAuthEnv,
  isSupabaseAuthConfigured
} from "@/lib/admin/auth";
