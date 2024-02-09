import { Context, InlineKeyboard } from "grammy";

const webLink = process.env.WEB_LINK!;

const bagsLink = `${webLink}/bags`;

export const showCheckBags = async (ctx: Context) => {
  const text =
    "Curious about what you got in your bags? You’ve come to the right place!";
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Check Bags 💰",
            `${bagsLink}?user=${ctx.from?.id}`,
          ),
        ],
      ],
    },
  });
};
