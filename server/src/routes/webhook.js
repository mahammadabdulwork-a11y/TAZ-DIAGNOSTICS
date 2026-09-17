import express from "express";
import { getDbAsync, saveDbAsync } from "../db.js";
import { handlePatientOptOut } from "../services/reminderEngine.js";

const router = express.Router();

/**
 * GET /api/whatsapp/webhook - Meta Webhook Verification (Hub Challenge)
 */
router.get("/webhook", async (req, res) => {
  const db = await getDbAsync();
  const verifyToken = db.settings?.webhookVerifyToken || "taz_diagnostic_webhook_secure_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Webhook successfully verified with Meta!");
    res.status(200).send(challenge);
  } else {
    console.warn("[WhatsApp Webhook] Verification failed: Token mismatch.");
    res.sendStatus(403);
  }
});

/**
 * POST /api/whatsapp/webhook - Receives status updates and inbound messages from WhatsApp Cloud API
 */
router.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    const db = await getDbAsync();

    if (body.object === "whatsapp_business_account" || body.entry) {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // 1. Delivery Status Updates (sent, delivered, read, failed)
          if (value?.statuses && Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const msgId = statusObj.id;
              const statusName = (statusObj.status || "").toUpperCase(); // SENT, DELIVERED, READ, FAILED
              const timestamp = statusObj.timestamp
                ? new Date(Number(statusObj.timestamp) * 1000).toISOString()
                : new Date().toISOString();

              console.log(`[WhatsApp Webhook] Message ${msgId} status: ${statusName}`);

              // Update reminder record
              const reminder = (db.reminders || []).find((r) => r.whatsappMessageId === msgId);
              if (reminder) {
                reminder.status = statusName;
                if (statusName === "DELIVERED") reminder.deliveredAt = timestamp;
                if (statusName === "READ") reminder.readAt = timestamp;
                if (statusName === "FAILED") {
                  reminder.failedAt = timestamp;
                  reminder.failureReason = statusObj.errors?.[0]?.message || "Delivery rejected by carrier";
                }
                reminder.updatedAt = new Date().toISOString();
              }

              // Update message log
              const msgLog = (db.messages || []).find((m) => m.whatsappMessageId === msgId);
              if (msgLog) {
                msgLog.status = statusName;
              }
            }
          }

          // 2. Incoming Messages from Patients (e.g. STOP, UNSUBSCRIBE, NO, HELP)
          if (value?.messages && Array.isArray(value.messages)) {
            for (const inMsg of value.messages) {
              const senderPhone = inMsg.from;
              const textBody = inMsg.text?.body?.trim() || "";
              const normalized = textBody.toUpperCase();

              console.log(`[WhatsApp Webhook] Received inbound message from ${senderPhone}: "${textBody}"`);

              // Log incoming message
              const inboundLog = {
                id: Date.now(),
                phone: `+${senderPhone}`,
                direction: "INBOUND",
                messageBody: textBody,
                status: "RECEIVED",
                whatsappMessageId: inMsg.id,
                rawPayload: inMsg,
                createdAt: new Date().toISOString()
              };
              db.messages = [inboundLog, ...(db.messages || [])];

              // Check for OPT-OUT keywords
              const optOutKeywords = ["STOP", "UNSUBSCRIBE", "NO", "CANCEL", "HALT", "QUIT"];
              if (optOutKeywords.includes(normalized)) {
                console.log(`[WhatsApp Webhook] Opt-out requested by ${senderPhone}. Deactivating reminders.`);
                await handlePatientOptOut(senderPhone, `Opt-out triggered by user message: "${textBody}"`);
              }
            }
          }
        }
      }

      await saveDbAsync(db);
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    }

    res.sendStatus(404);
  } catch (err) {
    console.error("[WhatsApp Webhook] Error processing webhook event:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
