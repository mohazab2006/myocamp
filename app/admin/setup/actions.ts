"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { closeOverdueRegistrations } from "@/lib/admin/camp-capacity";
import { runDailyCron } from "@/lib/admin/cron-daily";
import { runGmailPoll } from "@/lib/admin/gmail-poll";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import { runRemindersSweep } from "@/lib/admin/reminders-sweep";
import { expireOverdueClaims } from "@/lib/admin/waitlist";

function flash(base: string, type: "success" | "error" | "info", message: string): never {
  redirect(buildAdminRedirect(base, type, message));
}

function revalidateCronPaths() {
  revalidatePath("/admin/setup");
  revalidatePath("/admin/setup/gmail");
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/camps");
  revalidatePath("/admin/emails");
}

/** Same pipeline as the Vercel daily cron — all four jobs in one click. */
export async function runDailyCronAction() {
  await requireAuthorizedAdmin();

  try {
    const result = await runDailyCron();
    const gmail = result.gmail;
    const gmailLine =
      gmail.ok === true
        ? `Gmail: ${gmail.processed} new, ${gmail.autoMatched} matched.`
        : gmail.ok === false && gmail.skipped
          ? "Gmail: skipped (not connected)."
          : "Gmail: poll errored.";

    revalidateCronPaths();
    flash(
      "/admin/setup",
      "success",
      `Daily jobs done. ${gmailLine} Waitlist: ${result.waitlist.expired} expired. Camps: ${result.camps.closed} closed. Reminders: ${result.reminders.sent} sent, ${result.reminders.skipped} skipped.`
    );
  } catch (err) {
    flash(
      "/admin/setup",
      "error",
      err instanceof Error ? err.message : "Daily jobs failed."
    );
  }
}

export async function pollGmailNowAction() {
  await requireAuthorizedAdmin();

  const result = await runGmailPoll();
  revalidateCronPaths();

  if (result.ok) {
    if (result.processed === 0) {
      flash("/admin/setup", "info", "Gmail polled — no new Interac emails.");
    }
    flash(
      "/admin/setup",
      "success",
      `Gmail polled: ${result.processed} new email${result.processed === 1 ? "" : "s"}, ${result.autoMatched} auto-matched.`
    );
  }

  if (!result.ok) {
    if (result.skipped) {
      flash("/admin/setup", "error", "Gmail isn't connected. Open Gmail setup first.");
    }
    flash("/admin/setup", "error", result.error ?? "Gmail poll failed.");
  }
}

export async function expireWaitlistClaimsAction() {
  await requireAuthorizedAdmin();

  try {
    const { expired } = await expireOverdueClaims();
    revalidateCronPaths();
    flash(
      "/admin/setup",
      expired > 0 ? "success" : "info",
      expired === 0
        ? "No overdue waitlist claims to expire."
        : `Expired ${expired} overdue waitlist claim${expired === 1 ? "" : "s"}.`
    );
  } catch (err) {
    flash(
      "/admin/setup",
      "error",
      err instanceof Error ? err.message : "Waitlist sweep failed."
    );
  }
}

export async function closeOverdueCampsAction() {
  await requireAuthorizedAdmin();

  try {
    const { closed } = await closeOverdueRegistrations();
    revalidateCronPaths();
    flash(
      "/admin/setup",
      closed > 0 ? "success" : "info",
      closed === 0
        ? "No camps past their registration deadline."
        : `Closed ${closed} camp${closed === 1 ? "" : "s"} past registration deadline.`
    );
  } catch (err) {
    flash(
      "/admin/setup",
      "error",
      err instanceof Error ? err.message : "Camp close sweep failed."
    );
  }
}

export async function sendPaymentRemindersAction() {
  await requireAuthorizedAdmin();

  try {
    const summary = await runRemindersSweep();
    revalidateCronPaths();
    flash(
      "/admin/setup",
      summary.sent > 0 ? "success" : "info",
      summary.sent === 0
        ? `No reminders sent (${summary.skipped} skipped, ${summary.failed} failed).`
        : `Sent ${summary.sent} payment reminder${summary.sent === 1 ? "" : "s"} (${summary.skipped} skipped).`
    );
  } catch (err) {
    flash(
      "/admin/setup",
      "error",
      err instanceof Error ? err.message : "Reminder sweep failed."
    );
  }
}
