import { Context, InlineKeyboard } from "grammy";

const webLink = process.env.WEB_LINK!;

const sendTokensUrl = `${webLink}/send_tokens`;

export const showSendTokens = async (ctx: Context) => {
  const text =
    "Want to send money, coins, badges or NFTs? That’s easy! Just let me know what to send and where you want them to go.";
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Send Tokens 💸",
            `${sendTokensUrl}?user=${ctx.from?.id}`,
          ),
        ],
      ],
    },
  });
};
