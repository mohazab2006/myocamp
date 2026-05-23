import { closeOverdueRegistrations } from "@/lib/admin/camp-capacity";
import { runGmailPoll } from "@/lib/admin/gmail-poll";
import { runRemindersSweep } from "@/lib/admin/reminders-sweep";
import { expireOverdueClaims } from "@/lib/admin/waitlist";

export async function runDailyCron() {
  const [waitlist, camps, reminders, gmail] = await Promise.all([
    expireOverdueClaims(),
    closeOverdueRegistrations(),
    runRemindersSweep(),
    runGmailPoll()
  ]);

  return {
    waitlist,
    camps,
    reminders,
    gmail,
    sweptAt: new Date().toISOString()
  };
}
