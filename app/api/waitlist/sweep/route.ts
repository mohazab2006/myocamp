import { NextResponse, type NextRequest } from "next/server";

import { expireOverdueClaims } from "@/lib/admin/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET/POST /api/waitlist/sweep
 *
 * Called by Vercel Cron (hourly) to mark promoted waitlist entries that ran
 * out of claim time as `expired`. Frees the position for the next promotion.
 *
 * Auth: same model as /api/gmail/poll — Vercel cron header bypasses, manual
 * triggers need ?token=${CRON_SECRET} or Bearer header.
 */
export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}

async function run(req: NextRequest): Promise<NextResponse> {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { expired } = await expireOverdueClaims();
    return NextResponse.json({
      ok: true,
      expired,
      sweptAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[waitlist/sweep] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sweep failed" },
      { status: 500 }
    );
  }
}

function verifyAuth(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron")) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;
  if (req.headers.get("authorization") === `Bearer ${expected}`) return true;
  if (req.nextUrl.searchParams.get("token") === expected) return true;
  return false;
}
