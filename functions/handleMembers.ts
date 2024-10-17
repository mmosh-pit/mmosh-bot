import { Context, InlineKeyboard } from "grammy";
import { membersUrl } from "./buildMainMenuButtons";

export const handleMembers = async (ctx: Context) => {
  if (!ctx.from) return;
  const text = "View the Liquid Hearts Club membership directory.";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.webApp("Members", `${membersUrl}?user=${ctx.from.id}`)],
      ],
    },
  });
};
