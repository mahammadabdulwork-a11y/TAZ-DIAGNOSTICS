import express from "express";
import {
  getDbAsync,
  saveDbAsync
} from "../db.js";
import {
  processDueReminders,
  sendSingleReminderNow,
  advanceNextMonthlyCycle,
  handlePatientOptOut,
  getReminderStats,
  registerCompletedReportReminder
} from "../services/reminderEngine.js";
import { initScheduler } from "../scheduler.js";

const router = express.Router();

/**
 * GET /api/reminders - List all reminders with optional query filters
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDbAsync();
    let reminders = db.reminders || [];
    const { status, search } = req.query;

    if (status && status !== "ALL") {
      reminders = reminders.filter((r) => r.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      reminders = reminders.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.patientId.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    const stats = await getReminderStats();

    res.json({
      success: true,
      data: reminders,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reminders/stats - Dashboard KPIs
 */
router.get("/stats", async (_req, res) => {
  try {
    const stats = await getReminderStats();
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders/register - Create a scheduled reminder (called when report is completed)
 */
router.post("/register", async (req, res) => {
  try {
    const { patientId, patientName, phone, reportId, reportDate, testNames, optIn } = req.body;
    if (!patientId || !patientName || !phone) {
      return res.status(400).json({ success: false, error: "Missing required patient details" });
    }

    const reminder = await registerCompletedReportReminder({
      patientId,
      patientName,
      phone,
      reportId: reportId || "REP-AUTO",
      reportDate,
      testNames,
      optIn: optIn !== undefined ? optIn : true
    });

    res.json({
      success: true,
      message: "Monthly retest reminder scheduled successfully",
      reminder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders/process-due - Run automated due check immediately
 */
router.post("/process-due", async (_req, res) => {
  try {
    const results = await processDueReminders();
    res.json({
      success: true,
      message: `Processed ${results.totalChecked} reminders: ${results.dispatched} sent, ${results.failed} failed.`,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders/:id/send-now - Send an individual reminder immediately
 */
router.post("/:id/send-now", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sendSingleReminderNow(id);
    res.json({
      success: true,
      message: "Reminder dispatched successfully via WhatsApp",
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders/:id/advance-cycle - Move reminder to next month
 */
router.post("/:id/advance-cycle", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await advanceNextMonthlyCycle(id);
    res.json({
      success: true,
      message: "Reminder advanced to next monthly cycle",
      reminder: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/reminders/:id - Update reminder date, status, or opt-in
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nextReminderDate, status, optIn, phone } = req.body;
    const db = await getDbAsync();
    const reminder = (db.reminders || []).find((r) => r.id === id);

    if (!reminder) {
      return res.status(404).json({ success: false, error: "Reminder record not found" });
    }

    if (nextReminderDate !== undefined) reminder.nextReminderDate = nextReminderDate;
    if (status !== undefined) reminder.status = status;
    if (phone !== undefined) reminder.phone = phone;
    if (optIn !== undefined) {
      reminder.optIn = Boolean(optIn);
      // Also sync consents
      const consent = (db.consents || []).find((c) => c.patientId === reminder.patientId);
      if (consent) {
        consent.optIn = Boolean(optIn);
        if (!optIn) consent.optOutTimestamp = new Date().toISOString();
      }
      if (!optIn) {
        reminder.status = "OPTED OUT";
      } else if (reminder.status === "OPTED OUT") {
        reminder.status = "SCHEDULED";
      }
    }

    reminder.updatedAt = new Date().toISOString();
    await saveDbAsync(db);

    res.json({
      success: true,
      message: "Reminder updated successfully",
      reminder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders/opt-out - Opt out a patient by Phone or PatientID
 */
router.post("/opt-out", async (req, res) => {
  try {
    const { identifier, reason } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: "Identifier (patientId or phone) required" });
    }
    const result = await handlePatientOptOut(identifier, reason || "Admin opted out");
    res.json({
      success: true,
      message: `Opted out successfully. ${result.matchedCount} records updated.`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET & POST /api/reminders/settings - WhatsApp Business API configuration
 */
router.get("/settings", async (_req, res) => {
  try {
    const db = await getDbAsync();
    res.json({
      success: true,
      settings: db.settings || {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const db = await getDbAsync();
    db.settings = {
      ...(db.settings || {}),
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await saveDbAsync(db);

    // Refresh cron if schedule changed
    await initScheduler();

    res.json({
      success: true,
      message: "WhatsApp configuration saved successfully",
      settings: db.settings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reminders/messages - Message audit history
 */
router.get("/messages", async (_req, res) => {
  try {
    const db = await getDbAsync();
    res.json({
      success: true,
      data: db.messages || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
