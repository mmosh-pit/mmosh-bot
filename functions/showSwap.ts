import { Context, InlineKeyboard } from "grammy";
import { swapTokensUrl } from "./buildMainMenuButtons";

export const showSwap = async (ctx: Context) => {
  if (!ctx.from) return;

  const text = "Want to swap tokens? You've come to the right place!";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Swap Tokens 🤝",
            `${swapTokensUrl}?user=${ctx.from.id}`,
          ),
        ],
      ],
    },
  });
};
