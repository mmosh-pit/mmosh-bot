import type { Express } from "express";
import { webhookCallback } from "grammy";
import { createBotInstance } from "./bot/createBot";
import { getAllTelegramAgents } from "./utils/groups/getProjectToolsInfo";



export interface TenantBot {
  id: string;
  token: string;
  bot: any; // Bot<MyContext>
  projectId?: string;
}


export class BotManager {
  private bots = new Map<string, TenantBot>();


  constructor(private app: Express, private baseUrl: string) { }

  async initializeBots() {
    const allBots: any = await getAllTelegramAgents();
    console.log(allBots, "==allBots")
    for (let bot of allBots) {
      const botData = bot;
      const token = botData.data?.botToken || "";
      const id = botData._id.toString();
      const projectId = botData.project;
      try {
        if (!token) {
          console.warn(`[BotManager] No token for bot id=${id}, skipping initialization.`);
          continue;
        }
        await this.createBot(id, token, projectId);
        console.log(`[BotManager] Initialized bot for id=${id} And projectId=${projectId}`);
      } catch (err: any) {
        console.error(`[BotManager] Failed to initialize bot for id=${id}:`, err?.message || err);
      }
    }
  }

  async recreateBot(id: string) {
    const record = this.bots.get(id);
    if (!record) return;

    await record.bot.api.deleteWebhook();
    this.bots.delete(id);
  }


  // Create and register a bot for the given tenant id
  async createBot(id: string, token: string, projectId?: string) {
    id = id.toString();
    if (this.bots.has(id)) {
      console.log(`[BotManager] Bot for id=${id} already exists, returning existing instance.`);
      return this.bots.get(id)!;
    } else {
      console.log(`[BotManager] Creating new bot for id=${id}.`);
    }

    
    const { bot } = createBotInstance(token, projectId);


    // // Create a unique webhook route for this bot
    const route = `/webhook/${id}`;
    // // Register the express route and pass requests to grammY
    // this.app.post(route, webhookCallback(bot, "express"));


    // Tell Telegram to send updates to your route
    await bot.api.deleteWebhook();
    this.bots.delete(id);
    console.log("Setting webhook to:", `${this.baseUrl}${route}`);
    await bot.api.setWebhook(`${this.baseUrl}${route}`);


    const record: TenantBot = { id, token, bot, projectId };
    this.bots.set(id, record);
    console.log( this.bots.get(id), "==this.bots.get(id)")
    console.log(this.getBot(id), "==this.getBot(id) in createBot")
    console.log(this.bots, "==this.bots in createBot")

    return record;
  }


  // Remove bot and delete webhook
  async removeBot(id: string) {
    const r = this.bots.get(id);
    if (!r) return false;
    try {
      await r.bot.api.deleteWebhook();
    } catch (e) {
      // ignore
    }
    this.bots.delete(id);
    return true;
  }


  getBot(id: string) {
    console.log(this.bots.get(id), "==this.bots.get(id) in getBot")
    console.log(this.bots, "==this.bots in getBot")
    return this.bots.get(id);
  }


  listBots() {
    return Array.from(this.bots.values()).map((b) => ({ id: b.id }));
  }
}