import cron from "node-cron";
import { processDueReminders, getTodayDateString } from "./services/reminderEngine.js";
import { getDbAsync } from "./db.js";

let scheduledTask = null;

/**
 * Initializes the server-side cron scheduler for automated daily checks.
 */
export async function initScheduler() {
  const db = await getDbAsync();
  const settings = db.settings || {};
  const cronExpression = settings.dailyCronTime || "0 9 * * *"; // Every day at 09:00 AM

  if (scheduledTask) {
    scheduledTask.stop();
  }

  console.log(`[WhatsApp Reminder Engine] Initializing Cron Scheduler with rule: "${cronExpression}"`);

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`[WhatsApp Reminder Engine] Running scheduled daily reminder job for ${getTodayDateString()}...`);
    try {
      const result = await processDueReminders();
      console.log(`[WhatsApp Reminder Engine] Job finished: ${result.dispatched} sent, ${result.failed} failed, ${result.skipped} skipped.`);
    } catch (err) {
      console.error("[WhatsApp Reminder Engine] Cron execution failed:", err);
    }
  });

  return scheduledTask;
}

export function triggerImmediateCronRun() {
  return processDueReminders();
}
