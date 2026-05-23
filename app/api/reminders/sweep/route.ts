import { NextResponse, type NextRequest } from "next/server";

import { verifyCronAuth } from "@/lib/admin/cron-auth";
import { runRemindersSweep } from "@/lib/admin/reminders-sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST/GET /api/reminders/sweep
 *
 * Cron-triggered sweep that sends T-7 / T-3 / T-1 payment reminders.
 * On Vercel Hobby, use /api/cron/daily instead; this route remains for manual runs.
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
    const summary = await runRemindersSweep();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sweep failed" },
      { status: 500 }
    );
  }
}
