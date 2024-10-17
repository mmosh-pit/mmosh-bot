import { Context, InlineKeyboard } from "grammy";
import { joinClubUrl } from "./buildMainMenuButtons";

export const handleJoinTheClub = async (ctx: Context) => {
  if (!ctx.from) return;
  const text =
    "Want to earn more rewards, create your own coins, connect more deeply, form more supportive communities and build more rewarding projects? Join the club!";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.webApp("Coins", `${joinClubUrl}?user=${ctx.from.id}`)],
      ],
    },
  });
};
