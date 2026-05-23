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

export type GmailPollResult =
  | { ok: true; email: string; polledAt: string; processed: number; autoMatched: number }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; email?: string; error: string; processed: number; autoMatched: number };

export async function runGmailPoll(): Promise<GmailPollResult> {
  const creds = await fetchGmailCredentials();
  if (!creds) {
    return { ok: false, skipped: true, reason: "Gmail not connected" };
  }

  let seen = 0;
  let matched = 0;

  try {
    const accessToken = await getValidAccessToken(creds);
    const query = 'from:(payments.interac.ca OR interac.ca) newer_than:7d';
    const refs = await listInteracMessages(accessToken, query, 50);

    for (const ref of refs) {
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

    return {
      ok: true,
      email: creds.email,
      polledAt: new Date().toISOString(),
      processed: seen,
      autoMatched: matched
    };
  } catch (err) {
    console.error("[gmail/poll] error:", err);
    const error = err instanceof Error ? err.message : "Poll failed";
    await updatePollHeartbeat(creds.email, {
      status: "error",
      error,
      messagesSeen: seen,
      messagesMatched: matched
    });
    return { ok: false, skipped: false, email: creds.email, error, processed: seen, autoMatched: matched };
  }
}
