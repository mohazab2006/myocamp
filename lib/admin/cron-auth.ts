import type { NextRequest } from "next/server";

/** Shared auth for cron-triggered API routes. */
export function verifyCronAuth(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron")) return true;

  const expected = process.env.CRON_SECRET;
  if (!expected) return true;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return true;

  const token = req.nextUrl.searchParams.get("token") ?? req.nextUrl.searchParams.get("secret");
  return token === expected;
}
