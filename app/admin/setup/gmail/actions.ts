"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildAdminRedirect } from "@/lib/admin/page-state";
import { runGmailPoll } from "@/lib/admin/gmail-poll";
import { disconnectGmail } from "@/lib/admin/gmail";

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

/** Same pipeline as the daily cron Gmail step. */
export async function pollGmailNowAction() {
  await requireAuthorizedAdmin();

  const result = await runGmailPoll();
  revalidatePath("/admin/setup/gmail");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
  revalidatePath("/admin/setup");

  if (result.ok) {
    if (result.processed === 0) {
      flash("/admin/setup/gmail", "info", "Polled — no new Interac emails.");
    }
    flash(
      "/admin/setup/gmail",
      "success",
      `Processed ${result.processed} new email${result.processed === 1 ? "" : "s"} · auto-matched ${result.autoMatched}.`
    );
  }

  if (!result.ok) {
    if (result.skipped) {
      flash("/admin/setup/gmail", "error", "Gmail isn't connected yet.");
    }
    flash("/admin/setup/gmail", "error", result.error ?? "Poll failed.");
  }
}
