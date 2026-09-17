import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "reminders_db.json");

// Default initial dataset
const INITIAL_DATA = {
  settings: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || "taz_monthly_retest_reminder",
    templateLanguage: "en",
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "taz_diagnostic_webhook_secure_token",
    testMode: true,
    dailyCronTime: "0 9 * * *",
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  consents: [
    {
      patientId: "PAT001",
      optIn: true,
      consentTimestamp: new Date().toISOString(),
      channel: "WhatsApp",
      notes: "Opted in during registration"
    },
    {
      patientId: "PAT002",
      optIn: true,
      consentTimestamp: new Date().toISOString(),
      channel: "WhatsApp",
      notes: "Opted in during registration"
    },
    {
      patientId: "PAT003",
      optIn: false,
      consentTimestamp: new Date().toISOString(),
      optOutTimestamp: new Date().toISOString(),
      channel: "WhatsApp",
      notes: "Patient requested opt-out"
    }
  ],
  reminders: [
    {
      id: "REM-PAT001-01",
      patientId: "PAT001",
      patientName: "Mohammed Irfan",
      phone: "+919876543210",
      previousReportId: "REP001",
      previousTestDate: "2026-09-12",
      nextReminderDate: "2026-10-12",
      testList: "Complete Blood Picture (CBP), Urine Routine, Blood Sugar Fasting, Liver Function Test (LFT)",
      status: "SCHEDULED",
      optIn: true,
      cycleMonth: "2026-10",
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failedAt: null,
      failureReason: null,
      whatsappMessageId: null,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "REM-PAT002-01",
      patientId: "PAT002",
      patientName: "Ayesha Khan",
      phone: "+919988776655",
      previousReportId: "REP002",
      previousTestDate: "2026-08-12",
      nextReminderDate: "2026-09-12",
      testList: "Haemoglobin (Hb), Blood Sugar Fasting, Serum Creatinine",
      status: "DUE TODAY",
      optIn: true,
      cycleMonth: "2026-09",
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failedAt: null,
      failureReason: null,
      whatsappMessageId: null,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "REM-PAT003-01",
      patientId: "PAT003",
      patientName: "Arjun Reddy",
      phone: "+919123456780",
      previousReportId: "REP003",
      previousTestDate: "2026-08-15",
      nextReminderDate: "2026-09-15",
      testList: "Lipid Profile, HbA1c",
      status: "OPTED OUT",
      optIn: false,
      cycleMonth: "2026-09",
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failedAt: null,
      failureReason: "Patient opted out (STOP received)",
      whatsappMessageId: null,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  messages: []
};

let mysqlPool = null;
let isMysqlConnected = false;

export function isDbConnected() {
  return isMysqlConnected;
}

// Initialize MySQL Database Connection and Auto-create Schema
export async function initDb() {
  try {
    const host = process.env.MYSQL_HOST || "127.0.0.1";
    const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
    const user = process.env.MYSQL_USER || "root";
    const password = process.env.MYSQL_PASSWORD || "";
    const dbName = process.env.MYSQL_DATABASE || "taz_company";

    // 1. Ensure Database exists
    try {
      const rootConn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        connectTimeout: 4000
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await rootConn.end();
    } catch (dbCreateErr) {
      // Continue to try direct pool connection
    }

    // 2. Connect Pool to the target Database
    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database: dbName,
      connectTimeout: 4000
    });

    const conn = await mysqlPool.getConnection();
    conn.release();

    console.log(`[MySQL] Connected successfully to MySQL database "${dbName}" at ${host}:${port}!`);
    isMysqlConnected = true;

    // Create MySQL Tables
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number_id TEXT,
        business_account_id TEXT,
        access_token TEXT,
        template_name VARCHAR(120) DEFAULT 'taz_monthly_retest_reminder',
        template_language VARCHAR(20) DEFAULT 'en',
        webhook_verify_token VARCHAR(120) DEFAULT 'taz_diagnostic_webhook_secure_token',
        test_mode BOOLEAN DEFAULT true,
        daily_cron_time VARCHAR(30) DEFAULT '0 9 * * *',
        is_active BOOLEAN DEFAULT true,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS consents (
        patient_id VARCHAR(50) PRIMARY KEY,
        opt_in BOOLEAN DEFAULT true,
        consent_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        opt_out_timestamp DATETIME NULL,
        channel VARCHAR(50) DEFAULT 'WhatsApp',
        notes TEXT
      );
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id VARCHAR(100) PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        previous_report_id VARCHAR(100),
        previous_test_date DATE,
        next_reminder_date DATE NOT NULL,
        test_list TEXT,
        status VARCHAR(50) DEFAULT 'SCHEDULED',
        opt_in BOOLEAN DEFAULT true,
        cycle_month VARCHAR(7),
        sent_at DATETIME NULL,
        delivered_at DATETIME NULL,
        read_at DATETIME NULL,
        failed_at DATETIME NULL,
        failure_reason TEXT,
        whatsapp_message_id VARCHAR(255),
        retry_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reminder_id VARCHAR(100),
        patient_id VARCHAR(50),
        phone VARCHAR(50),
        direction VARCHAR(20),
        template_name VARCHAR(100),
        message_body TEXT,
        status VARCHAR(50),
        whatsapp_message_id VARCHAR(255),
        raw_payload JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed MySQL if empty
    const [settingsRows] = await mysqlPool.query("SELECT COUNT(*) as cnt FROM settings");
    if (settingsRows[0].cnt === 0) {
      const s = INITIAL_DATA.settings;
      await mysqlPool.query(
        `INSERT INTO settings (phone_number_id, business_account_id, access_token, template_name, template_language, webhook_verify_token, test_mode, daily_cron_time, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.phoneNumberId, s.businessAccountId, s.accessToken, s.templateName, s.templateLanguage, s.webhookVerifyToken, s.testMode, s.dailyCronTime, s.isActive]
      );
    }

    const [consentsRows] = await mysqlPool.query("SELECT COUNT(*) as cnt FROM consents");
    if (consentsRows[0].cnt === 0) {
      for (const c of INITIAL_DATA.consents) {
        await mysqlPool.query(
          `INSERT IGNORE INTO consents (patient_id, opt_in, consent_timestamp, opt_out_timestamp, channel, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [c.patientId, c.optIn, c.consentTimestamp, c.optOutTimestamp || null, c.channel, c.notes]
        );
      }
    }

    const [remindersRows] = await mysqlPool.query("SELECT COUNT(*) as cnt FROM reminders");
    if (remindersRows[0].cnt === 0) {
      for (const r of INITIAL_DATA.reminders) {
        await mysqlPool.query(
          `INSERT IGNORE INTO reminders (id, patient_id, patient_name, phone, previous_report_id, previous_test_date, next_reminder_date, test_list, status, opt_in, cycle_month, sent_at, delivered_at, read_at, failed_at, failure_reason, whatsapp_message_id, retry_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.id,
            r.patientId,
            r.patientName,
            r.phone,
            r.previousReportId,
            r.previousTestDate,
            r.nextReminderDate,
            r.testList,
            r.status,
            r.optIn,
            r.cycleMonth,
            r.sentAt,
            r.deliveredAt,
            r.readAt,
            r.failedAt,
            r.failureReason,
            r.whatsappMessageId,
            r.retryCount,
            r.createdAt,
            r.updatedAt
          ]
        );
      }
    }

    console.log("[MySQL] Database schema initialized & seeded successfully.");
  } catch (err) {
    isMysqlConnected = false;
    console.warn(`[MySQL] Connection status: ${err.message}.`);
    console.warn("[Database] Operating in local JSON file storage mode (reminders_db.json). Update server/.env with MYSQL_PASSWORD.");
  }
}

// Synchronous JSON file fallback
export function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf8");
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

export function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Async getDb supporting MySQL & File Fallback
export async function getDbAsync() {
  if (isMysqlConnected && mysqlPool) {
    try {
      // Settings
      const [settingsRows] = await mysqlPool.query("SELECT * FROM settings ORDER BY id DESC LIMIT 1");
      let settings = INITIAL_DATA.settings;
      if (settingsRows.length > 0) {
        const s = settingsRows[0];
        settings = {
          phoneNumberId: s.phone_number_id || "",
          businessAccountId: s.business_account_id || "",
          accessToken: s.access_token || "",
          templateName: s.template_name || "taz_monthly_retest_reminder",
          templateLanguage: s.template_language || "en",
          webhookVerifyToken: s.webhook_verify_token || "taz_diagnostic_webhook_secure_token",
          testMode: Boolean(s.test_mode),
          dailyCronTime: s.daily_cron_time || "0 9 * * *",
          isActive: Boolean(s.is_active),
          updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString()
        };
      }

      // Consents
      const [consentsRows] = await mysqlPool.query("SELECT * FROM consents ORDER BY consent_timestamp DESC");
      const consents = consentsRows.map((c) => ({
        patientId: c.patient_id,
        optIn: Boolean(c.opt_in),
        consentTimestamp: c.consent_timestamp ? new Date(c.consent_timestamp).toISOString() : new Date().toISOString(),
        optOutTimestamp: c.opt_out_timestamp ? new Date(c.opt_out_timestamp).toISOString() : null,
        channel: c.channel || "WhatsApp",
        notes: c.notes || ""
      }));

      // Reminders
      const [remindersRows] = await mysqlPool.query("SELECT * FROM reminders ORDER BY created_at DESC");
      const reminders = remindersRows.map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        patientName: r.patient_name,
        phone: r.phone,
        previousReportId: r.previous_report_id,
        previousTestDate: r.previous_test_date ? new Date(r.previous_test_date).toISOString().slice(0, 10) : "",
        nextReminderDate: r.next_reminder_date ? new Date(r.next_reminder_date).toISOString().slice(0, 10) : "",
        testList: r.test_list,
        status: r.status,
        optIn: Boolean(r.opt_in),
        cycleMonth: r.cycle_month,
        sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : null,
        deliveredAt: r.delivered_at ? new Date(r.delivered_at).toISOString() : null,
        readAt: r.read_at ? new Date(r.read_at).toISOString() : null,
        failedAt: r.failed_at ? new Date(r.failed_at).toISOString() : null,
        failureReason: r.failure_reason,
        whatsappMessageId: r.whatsapp_message_id,
        retryCount: r.retry_count || 0,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
      }));

      // Messages
      const [messagesRows] = await mysqlPool.query("SELECT * FROM messages ORDER BY created_at DESC");
      const messages = messagesRows.map((m) => ({
        id: m.id,
        reminderId: m.reminder_id,
        patientId: m.patient_id,
        phone: m.phone,
        direction: m.direction,
        templateName: m.template_name,
        messageBody: m.message_body,
        status: m.status,
        whatsappMessageId: m.whatsapp_message_id,
        rawPayload: m.raw_payload,
        createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString()
      }));

      return { settings, consents, reminders, messages };
    } catch (err) {
      console.error("[MySQL] getDbAsync error:", err.message);
      return getDb();
    }
  }

  return getDb();
}

// Async saveDb supporting MySQL & File Fallback
export async function saveDbAsync(data) {
  saveDb(data);

  if (isMysqlConnected && mysqlPool) {
    try {
      // Settings
      if (data.settings) {
        const s = data.settings;
        await mysqlPool.query(
          `INSERT INTO settings (id, phone_number_id, business_account_id, access_token, template_name, template_language, webhook_verify_token, test_mode, daily_cron_time, is_active, updated_at)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             phone_number_id = VALUES(phone_number_id),
             business_account_id = VALUES(business_account_id),
             access_token = VALUES(access_token),
             template_name = VALUES(template_name),
             template_language = VALUES(template_language),
             webhook_verify_token = VALUES(webhook_verify_token),
             test_mode = VALUES(test_mode),
             daily_cron_time = VALUES(daily_cron_time),
             is_active = VALUES(is_active),
             updated_at = NOW()`,
          [s.phoneNumberId, s.businessAccountId, s.accessToken, s.templateName, s.templateLanguage, s.webhookVerifyToken, s.testMode, s.dailyCronTime, s.isActive]
        );
      }

      // Consents
      if (Array.isArray(data.consents)) {
        for (const c of data.consents) {
          await mysqlPool.query(
            `INSERT INTO consents (patient_id, opt_in, consent_timestamp, opt_out_timestamp, channel, notes)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               opt_in = VALUES(opt_in),
               opt_out_timestamp = VALUES(opt_out_timestamp),
               notes = VALUES(notes)`,
            [c.patientId, c.optIn, c.consentTimestamp || new Date(), c.optOutTimestamp || null, c.channel || "WhatsApp", c.notes || ""]
          );
        }
      }

      // Reminders
      if (Array.isArray(data.reminders)) {
        for (const r of data.reminders) {
          await mysqlPool.query(
            `INSERT INTO reminders (id, patient_id, patient_name, phone, previous_report_id, previous_test_date, next_reminder_date, test_list, status, opt_in, cycle_month, sent_at, delivered_at, read_at, failed_at, failure_reason, whatsapp_message_id, retry_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               status = VALUES(status),
               next_reminder_date = VALUES(next_reminder_date),
               opt_in = VALUES(opt_in),
               cycle_month = VALUES(cycle_month),
               sent_at = VALUES(sent_at),
               delivered_at = VALUES(delivered_at),
               read_at = VALUES(read_at),
               failed_at = VALUES(failed_at),
               failure_reason = VALUES(failure_reason),
               whatsapp_message_id = VALUES(whatsapp_message_id),
               retry_count = VALUES(retry_count),
               updated_at = NOW()`,
            [
              r.id,
              r.patientId,
              r.patientName,
              r.phone,
              r.previousReportId,
              r.previousTestDate || null,
              r.nextReminderDate,
              r.testList,
              r.status,
              r.optIn,
              r.cycleMonth,
              r.sentAt || null,
              r.deliveredAt || null,
              r.readAt || null,
              r.failedAt || null,
              r.failureReason || null,
              r.whatsappMessageId || null,
              r.retryCount || 0,
              r.createdAt || new Date(),
              r.updatedAt || new Date()
            ]
          );
        }
      }
    } catch (err) {
      console.error("[MySQL] saveDbAsync error:", err.message);
    }
  }
}
