import { NextResponse, type NextRequest } from "next/server";

import { closeOverdueRegistrations } from "@/lib/admin/camp-capacity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST/GET /api/camps/sweep
 *
 * Closes camps whose registration_closes_at deadline has passed.
 * Runs daily via Vercel Cron.
 */
export async function POST(req: NextRequest) {
  return handle(req);
}
export async function GET(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
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

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;
  const auth = req.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;
  const fromQuery = req.nextUrl.searchParams.get("secret");
  return fromQuery === expected;
}
