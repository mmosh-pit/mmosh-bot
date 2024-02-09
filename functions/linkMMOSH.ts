import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Api, Bot, Context, InlineKeyboard, RawApi } from "grammy";
import { askForSolanaWallet } from "./askForSolanaWallet";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

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
