import { Api, Bot, RawApi } from "grammy";
import { MyContext } from "../models/MyContext";
import { MyConversation } from "../models/MyConversation";
import { getUserPoints } from "../utils/users/getUserPoints";
import { updateMMOSHData } from "../utils/users/updateMMOSHData";
import { showMenu } from "./showMenu";

export const askForSolanaWallet = async (
  conversation: MyConversation,
  ctx: MyContext,
  bot: Bot<MyContext, Api<RawApi>>,
): Promise<boolean> => {
  const resp = await conversation.wait();

  const wallet = resp.message?.text || "";

  if (!resp.message) {
    showMenu(ctx);
    return true;
  }

  const user = await getUserPoints(ctx.from!.id);

  if (!user) return false;

  const isWalletValid = await updateMMOSHData(wallet, {
    id: ctx.from!.id,
    username: ctx.from!.username || "",
    firstName: ctx.from!.first_name,
    points: user.points || 0,
  });

  if (!isWalletValid) {
    await resp.reply(
      "Sorry, I don’t see that address. Are you sure it’s the one you connected to your wallet? Please try again.",
    );
    return await askForSolanaWallet(conversation, ctx, bot);
  }

  await bot.api.sendMessage(
    ctx.chat!.id,
    "Nicely done! You’ve successfully connected your Solana wallet to the MMOSH.\n\nPlease [return to the web app](https://www.mmosh.app) and complete your registration.",
    {
      parse_mode: "Markdown",
    },
  );

  console.log("Finally returning");

  return true;
};
