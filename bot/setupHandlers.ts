// Put your bot handlers here. This module exports a function that attaches all
// commands, callbacks and conversations to a bot instance. Paste your existing
// single-bot handler code into the `setupHandlers` function body (replace the
// example handlers). Keep behaviour identical across dynamic instances.


import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";
import { MyContext } from "../models/MyContext";



export function setupHandlers(bot: Bot<MyContext>) {
  // Example handlers - replace these with your full handlers from the single-bot file.
  bot.command("start", async (ctx) => {
    await ctx.reply("Hello from dynamic bot!");
  });


  bot.on("message:text", async (ctx) => {
    console.log("[bot] received text:", ctx.message.text);
    // Insert your message handling + api calls here.
    await ctx.reply(`You wrote: ${ctx.message.text}`);
  });


  bot.callbackQuery("ping", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "pong" });
  });


  // Conversations and other complex logic can be created here as well.
}