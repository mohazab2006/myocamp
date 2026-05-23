import { NextResponse, type NextRequest } from "next/server";

import {
  extractBodies,
  fetchGmailCredentials,
  getGmailMessage,
  getHeader,
  getValidAccessToken,
  listInteracMessages,
  updatePollHeartbeat
} from "@/lib/admin/gmail";
import { parseInteracNotification } from "@/lib/admin/etransfer-parser";
import { findInboundEmailByGmailId, ingestEtransferEmail } from "@/lib/admin/inbound-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET/POST /api/gmail/poll
 *
 * Called by Vercel Cron (every 5 min) and/or manually from the admin Inbox.
 *
 * Auth modes:
 *   - Vercel Cron sets the `x-vercel-cron` header on its requests (no secret needed)
 *   - Manual / custom triggers must include `Authorization: Bearer ${CRON_SECRET}`
 *     OR `?token=${CRON_SECRET}`.
 *
 * Pipeline:
 *   1. Load gmail_credentials (refresh access token if needed)
 *   2. Query Gmail for recent Interac notifications
 *   3. For each new message (dedupe via inbound_emails.gmail_message_id):
 *      - Fetch full body, parse, attempt auto-match by reference code
 *      - Insert inbound_emails row + (if matched) payments row + recompute invoice
 *   4. Update heartbeat (last_polled_at, status, counts)
 */
export async function GET(req: NextRequest) {
  return runPoll(req);
}
export async function POST(req: NextRequest) {
  return runPoll(req);
}

async function runPoll(req: NextRequest): Promise<NextResponse> {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const creds = await fetchGmailCredentials();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "Gmail not connected. Visit /admin/setup/gmail." },
      { status: 503 }
    );
  }

  let seen = 0;
  let matched = 0;

  try {
    const accessToken = await getValidAccessToken(creds);

    // Pull anything from Interac in the last 7 days. Dedupe via DB.
    // (7d covers transient outages / backlog catch-up. Most polls find 0 new.)
    const query = 'from:(payments.interac.ca OR interac.ca) newer_than:7d';
    const refs = await listInteracMessages(accessToken, query, 50);

    for (const ref of refs) {
      // Skip if we've already processed this message id.
      const existing = await findInboundEmailByGmailId(ref.id);
      if (existing) continue;

      const message = await getGmailMessage(accessToken, ref.id);
      const fromAddress = getHeader(message, "From");
      const subject = getHeader(message, "Subject");
      const { text, html } = extractBodies(message);

      const parsed = parseInteracNotification({
        fromHeader: fromAddress,
        subject,
        bodyText: text
      });

      const receivedMs = message.internalDate ? Number(message.internalDate) : Date.now();
      const receivedAt = new Date(receivedMs).toISOString();

      const outcome = await ingestEtransferEmail({
        gmailMessageId: ref.id,
        fromAddress,
        subject,
        bodyText: text,
        bodyHtml: html,
        receivedAt,
        parsed,
        rawPayload: {
          gmail: {
            id: message.id,
            threadId: message.threadId,
            snippet: message.snippet,
            labelIds: message.labelIds
          }
        }
      });

      seen += 1;
      if (outcome.matched) matched += 1;
    }

    await updatePollHeartbeat(creds.email, {
      status: "ok",
      error: null,
      messagesSeen: seen,
      messagesMatched: matched
    });

    return NextResponse.json({
      ok: true,
      email: creds.email,
      polledAt: new Date().toISOString(),
      processed: seen,
      autoMatched: matched
    });
  } catch (err) {
    console.error("[gmail/poll] error:", err);
    await updatePollHeartbeat(creds.email, {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      messagesSeen: seen,
      messagesMatched: matched
    });
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Poll failed" },
      { status: 500 }
    );
  }
}

function verifyAuth(req: NextRequest): boolean {
  // Vercel Cron requests include this header automatically.
  if (req.headers.get("x-vercel-cron")) return true;

  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // no secret configured = dev mode, allow

  const fromAuth = req.headers.get("authorization");
  if (fromAuth === `Bearer ${expected}`) return true;

  const fromQuery = req.nextUrl.searchParams.get("token");
  if (fromQuery === expected) return true;

  return false;
}
