import { getDbAsync, saveDbAsync } from "../db.js";
import { sendWhatsAppRetestReminder } from "./whatsappService.js";

/**
 * Accurately adds months with calendar-aware clamping:
 * e.g., 31 Jan + 1 month -> 28/29 Feb; 31 Mar + 1 month -> 30 Apr.
 */
export function addCalendarMonths(dateString, monthsToAdd = 1) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);

  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + monthsToAdd);

  // If the month rolled over because the target month has fewer days, clamp to last day of target month
  if (d.getDate() !== originalDay) {
    d.setDate(0);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns YYYY-MM cycle string
 */
export function getCycleMonthString(dateString) {
  return String(dateString).slice(0, 7);
}

/**
 * Registers or updates a scheduled retest reminder when a laboratory report is completed.
 */
export async function registerCompletedReportReminder({
  patientId,
  patientName,
  phone,
  reportId,
  reportDate,
  testNames = [],
  optIn = true
}) {
  const db = await getDbAsync();
  const todayStr = getTodayDateString();
  const prevDate = reportDate || todayStr;
  const nextReminder = addCalendarMonths(prevDate, 1);
  const cycleMonth = getCycleMonthString(nextReminder);

  const testListFormatted = Array.isArray(testNames) && testNames.length
    ? testNames.slice(0, 8).join(", ")
    : "Routine Diagnostic Profile";

  const reminderId = `REM-${patientId}-${Date.now().toString().slice(-4)}`;

  // Ensure consent is recorded
  const existingConsentIdx = (db.consents || []).findIndex(
    (c) => c.patientId === patientId
  );
  if (existingConsentIdx >= 0) {
    db.consents[existingConsentIdx].optIn = Boolean(optIn);
    db.consents[existingConsentIdx].updatedAt = new Date().toISOString();
  } else {
    db.consents.push({
      patientId,
      optIn: Boolean(optIn),
      consentTimestamp: new Date().toISOString(),
      channel: "WhatsApp",
      notes: "Auto-captured upon registration/report creation"
    });
  }

  // Deactivate any existing active reminders for this patient to avoid duplicate cycles
  db.reminders = (db.reminders || []).map((r) => {
    if (r.patientId === patientId && (r.status === "SCHEDULED" || r.status === "DUE TODAY")) {
      return { ...r, status: "SUPERSEDED", updatedAt: new Date().toISOString() };
    }
    return r;
  });

  const isDueToday = nextReminder <= todayStr;

  const newReminder = {
    id: reminderId,
    patientId,
    patientName,
    phone,
    previousReportId: reportId,
    previousTestDate: prevDate,
    nextReminderDate: nextReminder,
    testList: testListFormatted,
    status: optIn ? (isDueToday ? "DUE TODAY" : "SCHEDULED") : "OPTED OUT",
    optIn: Boolean(optIn),
    cycleMonth,
    sentAt: null,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failureReason: null,
    whatsappMessageId: null,
    retryCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.reminders.unshift(newReminder);
  await saveDbAsync(db);

  return newReminder;
}

/**
 * Executes the Daily Automated WhatsApp Reminder Engine.
 * Finds all patients where next_reminder_date <= today and sends the WhatsApp template.
 */
export async function processDueReminders() {
  const db = await getDbAsync();
  const todayStr = getTodayDateString();
  const results = {
    totalChecked: 0,
    dispatched: 0,
    failed: 0,
    skipped: 0,
    items: []
  };

  const reminders = db.reminders || [];

  for (let i = 0; i < reminders.length; i++) {
    const item = reminders[i];
    results.totalChecked++;

    // Check eligibility:
    // 1. Next reminder is on or before today
    // 2. Status is SCHEDULED or DUE TODAY or FAILED (eligible for retry)
    // 3. Patient has opt-in enabled
    // 4. Has not already successfully sent in this cycle month
    const isDue = item.nextReminderDate <= todayStr;
    const isEligibleStatus =
      item.status === "SCHEDULED" ||
      item.status === "DUE TODAY" ||
      (item.status === "FAILED" && item.retryCount < 3);

    const consent = (db.consents || []).find((c) => c.patientId === item.patientId);
    const hasOptIn = consent ? consent.optIn : item.optIn;

    if (!hasOptIn) {
      item.status = "OPTED OUT";
      item.failureReason = "Patient has opted out of WhatsApp messages";
      item.updatedAt = new Date().toISOString();
      results.skipped++;
      continue;
    }

    if (!isDue || !isEligibleStatus) {
      // If date is today but marked scheduled, ensure it is flagged DUE TODAY
      if (item.nextReminderDate === todayStr && item.status === "SCHEDULED") {
        item.status = "DUE TODAY";
        item.updatedAt = new Date().toISOString();
      }
      results.skipped++;
      continue;
    }

    // Attempt dispatch
    try {
      const sendResult = await sendWhatsAppRetestReminder({
        phone: item.phone,
        patientName: item.patientName,
        previousTestDate: item.previousTestDate,
        testList: item.testList,
        reminderId: item.id,
        patientId: item.patientId
      });

      if (sendResult.success) {
        item.status = "SENT";
        item.sentAt = new Date().toISOString();
        item.whatsappMessageId = sendResult.messageId;
        item.failureReason = null;
        item.updatedAt = new Date().toISOString();

        results.dispatched++;
        results.items.push({
          id: item.id,
          patient: item.patientName,
          status: "SENT",
          messageId: sendResult.messageId
        });
      } else {
        item.status = "FAILED";
        item.failedAt = new Date().toISOString();
        item.failureReason = sendResult.error || "WhatsApp delivery failed";
        item.retryCount = (item.retryCount || 0) + 1;
        item.updatedAt = new Date().toISOString();

        results.failed++;
        results.items.push({
          id: item.id,
          patient: item.patientName,
          status: "FAILED",
          error: sendResult.error
        });
      }
    } catch (err) {
      item.status = "FAILED";
      item.failedAt = new Date().toISOString();
      item.failureReason = err.message;
      item.retryCount = (item.retryCount || 0) + 1;
      item.updatedAt = new Date().toISOString();

      results.failed++;
      results.items.push({
        id: item.id,
        patient: item.patientName,
        status: "FAILED",
        error: err.message
      });
    }
  }

  await saveDbAsync(db);
  return results;
}

/**
 * Sends a single reminder immediately on demand.
 */
export async function sendSingleReminderNow(reminderId) {
  const db = await getDbAsync();
  const reminder = (db.reminders || []).find((r) => r.id === reminderId);
  if (!reminder) {
    throw new Error("Reminder record not found");
  }

  const consent = (db.consents || []).find((c) => c.patientId === reminder.patientId);
  if (consent && !consent.optIn) {
    throw new Error("Patient has opted out of WhatsApp reminders");
  }

  const result = await sendWhatsAppRetestReminder({
    phone: reminder.phone,
    patientName: reminder.patientName,
    previousTestDate: reminder.previousTestDate,
    testList: reminder.testList,
    reminderId: reminder.id,
    patientId: reminder.patientId
  });

  if (result.success) {
    reminder.status = "SENT";
    reminder.sentAt = new Date().toISOString();
    reminder.whatsappMessageId = result.messageId;
    reminder.failureReason = null;
    reminder.updatedAt = new Date().toISOString();
  } else {
    reminder.status = "FAILED";
    reminder.failedAt = new Date().toISOString();
    reminder.failureReason = result.error;
    reminder.retryCount = (reminder.retryCount || 0) + 1;
    reminder.updatedAt = new Date().toISOString();
  }

  await saveDbAsync(db);
  return { reminder, result };
}

/**
 * Advances the reminder to the next monthly retest date (e.g. after a message was sent or when admin advances cycle).
 */
export async function advanceNextMonthlyCycle(reminderId) {
  const db = await getDbAsync();
  const reminder = (db.reminders || []).find((r) => r.id === reminderId);
  if (!reminder) throw new Error("Reminder not found");

  const currentReminderDate = reminder.nextReminderDate;
  const nextDate = addCalendarMonths(currentReminderDate, 1);
  const cycleMonth = getCycleMonthString(nextDate);

  reminder.nextReminderDate = nextDate;
  reminder.cycleMonth = cycleMonth;
  reminder.status = "SCHEDULED";
  reminder.updatedAt = new Date().toISOString();

  await saveDbAsync(db);
  return reminder;
}

/**
 * Handles patient opt-out ("STOP", "UNSUBSCRIBE", "NO").
 */
export async function handlePatientOptOut(phoneOrPatientId, reason = "Patient opted out") {
  const db = await getDbAsync();
  const cleanPhone = String(phoneOrPatientId).replace(/[^0-9]/g, "");

  // Update consent table
  let matchedCount = 0;
  db.consents = (db.consents || []).map((c) => {
    if (c.patientId === phoneOrPatientId || c.patientId.includes(phoneOrPatientId)) {
      matchedCount++;
      return {
        ...c,
        optIn: false,
        optOutTimestamp: new Date().toISOString(),
        notes: reason
      };
    }
    return c;
  });

  // Update reminders
  db.reminders = (db.reminders || []).map((r) => {
    const rCleanPhone = String(r.phone).replace(/[^0-9]/g, "");
    if (
      r.patientId === phoneOrPatientId ||
      r.phone === phoneOrPatientId ||
      (cleanPhone && rCleanPhone.includes(cleanPhone))
    ) {
      matchedCount++;
      return {
        ...r,
        optIn: false,
        status: "OPTED OUT",
        failureReason: reason,
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });

  await saveDbAsync(db);
  return { success: true, matchedCount };
}

/**
 * Computes live dashboard metrics.
 */
export async function getReminderStats() {
  const db = await getDbAsync();
  const reminders = db.reminders || [];
  const todayStr = getTodayDateString();

  return {
    total: reminders.length,
    dueToday: reminders.filter(
      (r) => r.nextReminderDate === todayStr && (r.status === "SCHEDULED" || r.status === "DUE TODAY")
    ).length,
    scheduled: reminders.filter((r) => r.status === "SCHEDULED").length,
    sent: reminders.filter((r) => r.status === "SENT").length,
    delivered: reminders.filter((r) => r.status === "DELIVERED").length,
    read: reminders.filter((r) => r.status === "READ").length,
    failed: reminders.filter((r) => r.status === "FAILED").length,
    optedOut: reminders.filter((r) => r.status === "OPTED OUT" || !r.optIn).length
  };
}
