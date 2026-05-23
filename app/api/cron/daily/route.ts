import { NextResponse, type NextRequest } from "next/server";

import { verifyCronAuth } from "@/lib/admin/cron-auth";
import { runDailyCron } from "@/lib/admin/cron-daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET/POST /api/cron/daily
 *
 * Single once-per-day job for Vercel Hobby: Gmail poll, waitlist expiry,
 * camp close, and invoice reminders.
 */
export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyCron();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/daily] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Daily cron failed" },
      { status: 500 }
    );
  }
}
