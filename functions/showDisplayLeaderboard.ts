import { Context, InlineKeyboard } from "grammy";

const webLink = process.env.WEB_LINK!;

const directoryUrl = `${webLink}/directory`;

export const showDisplayLeaderboard = async (ctx: Context) => {
  const text = "Where do you rank? Let’s display the status and find out.";
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Display Status 🏆",
            `${directoryUrl}?user=${ctx.from?.id}`,
          ),
        ],
      ],
    },
  });
};
