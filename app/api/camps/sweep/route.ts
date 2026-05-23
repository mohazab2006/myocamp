import { NextResponse, type NextRequest } from "next/server";

import { closeOverdueRegistrations } from "@/lib/admin/camp-capacity";
import { verifyCronAuth } from "@/lib/admin/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST/GET /api/camps/sweep
 *
 * Closes camps whose registration_closes_at deadline has passed.
 * On Vercel Hobby, runs via /api/cron/daily; this route remains for manual runs.
 */
export async function POST(req: NextRequest) {
  return handle(req);
}
export async function GET(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { closed } = await closeOverdueRegistrations();
    return NextResponse.json({ ok: true, closed });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sweep failed" },
      { status: 500 }
    );
  }
}
