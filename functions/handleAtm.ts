import { Context, InlineKeyboard } from "grammy";
import { atmUrl } from "./buildMainMenuButtons";

export const handleAtm = async (ctx: Context) => {
  const text =
    "Buy crypto directly from your bank account with a credit or debit card.";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [[InlineKeyboard.url("ATM", atmUrl)]],
    },
  });
};
