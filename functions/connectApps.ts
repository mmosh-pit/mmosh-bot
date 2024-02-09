import { ConversationFlavor } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";

type MyContext = Context & ConversationFlavor;

export const connectApps = async (ctx: MyContext) => {
  await ctx.reply(
    "Let’s connect your Telegram account to the MMOSH.\n\nFirst, please connect a Solana wallet to the [MMOSH web app](https://www.mmosh.app) and press the button when you’re done. We recommend Phantom, Solflare or Glow.",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            InlineKeyboard.text("Done ✅", "done-connect"),
            InlineKeyboard.text("Main Menu 🪧", "main-menu"),
          ],
        ],
      },
    },
  );
};
