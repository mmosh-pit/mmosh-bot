import { Context, InlineKeyboard } from "grammy";
import { myProfileUrl } from "./buildMainMenuButtons";

export const handleProfile = async (ctx: Context) => {
  if (!ctx.from) return;
  const text = "View the Coins created by Liquid Hearts Club members.";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Profile",
            `${myProfileUrl}?user=${ctx.from.id}`,
          ),
        ],
      ],
    },
  });
};
