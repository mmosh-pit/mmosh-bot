import { Context, InlineKeyboard } from "grammy";

export const showJoinGroup = async (ctx: Context) => {
  const text =
    "Join our team and your fellow Liquid Hearts Club members in Visitors Center for guidance on getting the most out of your Social Wallet on Telegram.";
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.url("Join Group 👋", `https://t.me/mmoshpit`)],
      ],
    },
  });
};
