import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import remindersRouter from "./routes/reminders.js";
import webhookRouter from "./routes/webhook.js";
import { initScheduler } from "./scheduler.js";
import { initDb, isDbConnected } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/reminders", remindersRouter);
app.use("/api/whatsapp", webhookRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    application: "TAZ COMPANY",
    product: "TAZ DIAGNOSTIC",
    status: "online",
    database: isDbConnected() ? "MySQL Connected" : "Local File Fallback",
    feature: "Live Monthly WhatsApp Retest Reminders",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize MySQL Database Pool & Tables
  await initDb();

  app.listen(PORT, async () => {
    console.log("======================================");
    console.log("TAZ COMPANY — TAZ DIAGNOSTIC SERVER");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Database Mode: ${isDbConnected() ? "MySQL DB" : "File Storage (reminders_db.json)"}`);
    console.log("WhatsApp Webhook: /api/whatsapp/webhook");
    console.log("======================================");

    // Start background daily scheduler
    try {
      await initScheduler();
    } catch (err) {
      console.error("Failed to start reminder scheduler:", err);
    }
  });
}

startServer();
