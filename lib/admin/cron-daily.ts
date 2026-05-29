import { closeOverdueRegistrations } from "@/lib/admin/camp-capacity";
import { runGmailPoll } from "@/lib/admin/gmail-poll";
import { runPaymentFollowupSweep } from "@/lib/admin/payment-followup-sweep";
import { runRemindersSweep } from "@/lib/admin/reminders-sweep";
import { expireOverdueClaims } from "@/lib/admin/waitlist";

export async function runDailyCron() {
  const [waitlist, camps, reminders, paymentFollowup, gmail] = await Promise.all([
    expireOverdueClaims(),
    closeOverdueRegistrations(),
    runRemindersSweep(),
    runPaymentFollowupSweep(),
    runGmailPoll()
  ]);

  return {
    waitlist,
    camps,
    reminders,
    paymentFollowup,
    gmail,
    sweptAt: new Date().toISOString()
  };
}
