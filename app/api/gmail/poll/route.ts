import { NextResponse, type NextRequest } from "next/server";

import { verifyCronAuth } from "@/lib/admin/cron-auth";
import { runGmailPoll } from "@/lib/admin/gmail-poll";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET/POST /api/gmail/poll
 *
 * Poll Gmail for Interac e-transfers. Runs daily via /api/cron/daily on Hobby;
 * this route remains for manual runs from admin or curl.
 */
export async function GET(req: NextRequest) {
  return runPoll(req);
}
export async function POST(req: NextRequest) {
  return runPoll(req);
}

async function runPoll(req: NextRequest): Promise<NextResponse> {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGmailPoll();
  if (result.ok) {
    return NextResponse.json(result);
  }
  if (result.skipped) {
    return NextResponse.json(
      { ok: false, error: `${result.reason}. Visit /admin/setup/gmail.` },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { ok: false, error: result.error, email: result.email, processed: result.processed, autoMatched: result.autoMatched },
    { status: 500 }
  );
}
