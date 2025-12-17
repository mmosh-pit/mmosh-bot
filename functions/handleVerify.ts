import { Context } from "grammy";
import { generateLink } from "../utils/users/generateLink";
import { getLinkedUser } from "../utils/users/getLinkedUser";
import { getUserFromDB } from "../utils/users/getUserFromDB";

export const handleVerify = async (ctx: Context) => {
  console.log("Handling verify...");
  const from = ctx.from;

  if (!from) return;

  const userData = await getUserFromDB(from.id);

  if (
    (!ctx.message?.text?.includes("start") &&
      ctx.message?.chat.type === "private") ||
    ctx.callbackQuery
  ) {
    const mmoshData = await getLinkedUser(from.id);

    if (!mmoshData) {
      const link = await generateLink(userData?.addressPublicKey!);
      const text = `Hey ${from.first_name}, it’s very important you verify your Telegram account. Telegram is a centralized messaging service. If you lose access your Telegram account for any reason, you can lose all the tokens in your Social Wallet. By verifying your Telegram account, you can retrieve your private key, link a separate Solana wallet and maintain control over the tokens in your Social Wallet.\n\nVerify your Telegram account on the MMOSH app by following this link:\n\n${link}`;

      await ctx.reply(text);

      return;
    }

    const text =
      "You're already verified on MMOSH, just go to our website with the wallet you have linked and enjoy!";

    await ctx.reply(text);

    return;
  }
};
