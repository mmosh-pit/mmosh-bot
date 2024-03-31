import { PublicKey } from "@solana/web3.js";
import { InlineKeyboard } from "grammy";
import { MyContext } from "../models/MyContext";
import { MyConversation } from "../models/MyConversation";
import { getTokenMetadata } from "../utils/web3/getTokenMetadata";

export async function tokenGatingConversation(
  conversation: MyConversation,
  ctx: MyContext,
) {
  const groupId = ctx.groupId;

  const res = await getTypeOfToken(conversation, ctx);

  let text = "";
  let tokenType = ""

  switch (res) {
    case "passes" || "profiles": {
      text = `Please enter the collection address for the ${res} that you want to configure as a Token Gating Rule!`
      tokenType = "nft";
      break;
    }
    case "badges": {
      text = "Please enter the collection address for the badges that you want to configure as a Token Gating Rule!"
      tokenType = "sft";
      break;
    }
    case "coins": {
      text = "Please enter the token address for the coin that you want to configure as a Token Gating Rule!" 
      tokenType = "coin";
      break;
    }

    default: {
      break;
    }
  }

  await ctx.reply(text);

  const { message } = await conversation.wait();

  if (!message?.text || !PublicKey.isOnCurve(message)) {
    await ctx.reply(text);
  }

  const metadata = await getTokenMetadata(message!.text!)

  console.log("Metadata: ", metadata);

  await ctx.reply("Good!")
  await ctx.conversation.exit();
}

async function getTypeOfToken(
  conversation: MyConversation,
  ctx: MyContext,
): Promise<string> {
  await ctx.reply(
    "Please select the type of token you would like to use as the Token Gating rule",
    {
      reply_markup: {
        inline_keyboard: [[
          InlineKeyboard.text("Passes", "passes"),
          InlineKeyboard.text("Profiles", "profiles"),
          InlineKeyboard.text("Badges", "badges"),
          InlineKeyboard.text("Coins", "coins"),
        ]],
      },
    },
  );

  const response = await conversation.waitForCallbackQuery([
    "passes",
    "profiles",
    "badges",
    "coins"
  ]);

  return response.match as string;
}
