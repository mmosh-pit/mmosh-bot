import { Context } from "grammy";
import { buildMainMenuButtons } from "./buildMainMenuButtons";

export const showMenu = async (ctx: Context) => {
  const text = `Liquid Hearts Club is a Telegram bot and Web3 app where you can form deeper relationships, join and build supportive communities and collaborate on significant and rewarding projects.\nPlease choose one of the options to continue.`;
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from?.id || 0),
    },
  });
};
