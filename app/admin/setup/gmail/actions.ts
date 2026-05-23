"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import {
  disconnectGmail,
  extractBodies,
  fetchGmailCredentials,
  getGmailMessage,
  getHeader,
  getValidAccessToken,
  listInteracMessages,
  updatePollHeartbeat
} from "@/lib/admin/gmail";
import { parseInteracNotification } from "@/lib/admin/etransfer-parser";
import {
  findInboundEmailByGmailId,
  ingestEtransferEmail
} from "@/lib/admin/inbound-emails";

function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

export async function disconnectGmailAction(formData: FormData) {
  await requireAuthorizedAdmin();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) flash("/admin/setup/gmail", "error", "Missing email.");

  try {
    await disconnectGmail(email);
  } catch (err) {
    flash(
      "/admin/setup/gmail",
      "error",
      err instanceof Error ? err.message : "Could not disconnect."
    );
  }
  revalidatePath("/admin/setup/gmail");
  revalidatePath("/admin");
  flash("/admin/setup/gmail", "success", `Disconnected ${email}.`);
}

/**
 * "Poll now" — runs the same pipeline as the cron route but synchronously
 * so the admin sees an immediate flash banner with the result.
 */
export async function pollGmailNowAction() {
  await requireAuthorizedAdmin();

  const creds = await fetchGmailCredentials();
  if (!creds) {
    flash("/admin/setup/gmail", "error", "Gmail isn't connected yet.");
  }

  let seen = 0;
  let matched = 0;
  try {
    const accessToken = await getValidAccessToken(creds!);
    const refs = await listInteracMessages(
      accessToken,
      "from:(payments.interac.ca OR interac.ca) newer_than:7d",
      50
    );

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
          gmail: { id: message.id, threadId: message.threadId, snippet: message.snippet }
        }
      });
      seen += 1;
      if (outcome.matched) matched += 1;
    }

    await updatePollHeartbeat(creds!.email, {
      status: "ok",
      error: null,
      messagesSeen: seen,
      messagesMatched: matched
    });
  } catch (err) {
    await updatePollHeartbeat(creds!.email, {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      messagesSeen: seen,
      messagesMatched: matched
    });
    flash(
      "/admin/setup/gmail",
      "error",
      err instanceof Error ? err.message : "Poll failed."
    );
  }

  revalidatePath("/admin/setup/gmail");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");

  if (seen === 0) {
    flash("/admin/setup/gmail", "info", "Polled — no new Interac emails.");
  }
  flash(
    "/admin/setup/gmail",
    "success",
    `Processed ${seen} new email${seen === 1 ? "" : "s"} · auto-matched ${matched}.`
  );
}
