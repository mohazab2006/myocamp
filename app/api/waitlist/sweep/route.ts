import { NextResponse, type NextRequest } from "next/server";

import { verifyCronAuth } from "@/lib/admin/cron-auth";
import { expireOverdueClaims } from "@/lib/admin/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET/POST /api/waitlist/sweep
 *
 * Marks promoted waitlist entries that ran
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
  if (!verifyCronAuth(req)) {
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
