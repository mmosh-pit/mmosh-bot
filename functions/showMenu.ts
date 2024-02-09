import { Context } from "grammy";
import { buildMainMenuButtons } from "./buildMainMenuButtons";

export const showMenu = async (ctx: Context) => {
  const text = `👋 Hey! Let me know what you’d like to do next.`;
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from?.id || 0),
    },
  });
};
