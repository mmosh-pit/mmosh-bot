import express from "express";
import { BotManager } from "./botManager";

import dotenv from 'dotenv';
import { webhookCallback } from "grammy";
dotenv.config();
const PORT = Number(process.env.PORT || 3003);
const BASE_URL = process.env.NODE_PUBLIC_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";


if (!BASE_URL) {
  console.error("NODE_PUBLIC_URL must be set in environment (ngrok or domain)");
  process.exit(1);
}


const app = express();
app.use(express.json());


const botManager = new BotManager(app, BASE_URL);
botManager.initializeBots().then(() => {
  console.log("[BotManager] All bots initialized");
});

// Health
app.get("/health", (req, res) => res.json({ ok: true }));


// Admin-protected endpoint to register a bot (SaaS flow)
app.post("/register-bot", async (req, res) => {
  /* const admin = req.headers["x-admin-token"] as string | undefined;
  if (ADMIN_TOKEN && admin !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  } */


  const { id, token } = req.body;
  if (!id || !token) return res.status(400).json({ error: "id & token required" });


  try {
    const entry = await botManager.createBot(id, token);
    return res.json({ ok: true, webhook: `${BASE_URL}/webhook/${id}` });
  } catch (err: any) {
    console.error("createBot error", err?.message || err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});


app.post("/remove-bot", async (req, res) => {
  // const admin = req.headers["x-admin-token"] as string | undefined;
  // if (ADMIN_TOKEN && admin !== ADMIN_TOKEN) {
  //   return res.status(401).json({ error: "unauthorized" });
  // }


  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id required" });
  const ok = await botManager.removeBot(id);
  return res.json({ ok });
});

app.post("/webhook/:id", (req, res) => {
  console.log("Received webhook for bot id=", req.params.id);
  const record = botManager.getBot(req.params.id);
  console.log("Record found:", !!record);
  if (!record) return res.sendStatus(404);
  console.log("Passing to webhook callback");
  return webhookCallback(record.bot, "express")(req, res);
});

app.get("/list-bots", (req, res) => res.json(botManager.listBots()));


// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export const appServer = app;
