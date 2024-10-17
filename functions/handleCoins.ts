import { Context, InlineKeyboard } from "grammy";
import { coinsLinkUrl } from "./buildMainMenuButtons";

export const handleCoins = async (ctx: Context) => {
  if (!ctx.from) return;
  const text = "View the Coins created by Liquid Hearts Club members.";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.webApp("Coins", `${coinsLinkUrl}?user=${ctx.from.id}`)],
      ],
    },
  });
};
