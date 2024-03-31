import { Api, Bot, InlineKeyboard, RawApi } from "grammy";
import { MyContext } from "../models/MyContext";
import { MyConversation } from "../models/MyConversation";
import { askForSolanaWallet } from "./askForSolanaWallet";

export const linkMMOSH = async (
  conversation: MyConversation,
  ctx: MyContext,
  bot: Bot<MyContext, Api<RawApi>>,
) => {
  if (!ctx.from) return;
  await ctx.reply(
    "Next, To enter the Solana wallet address that you used to connect to the web app in the message field below, and send it here.",
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.text("Cancel ❌", "cancel-connect")]],
      },
    },
  );

  await askForSolanaWallet(conversation, ctx, bot);

  return;
};
