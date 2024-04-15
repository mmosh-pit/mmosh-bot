import { Context, NextFunction } from "grammy";
import { generateLink } from "../utils/users/generateLink";
import { getLinkedUser } from "../utils/users/getLinkedUser";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { updateUserData } from "../utils/users/updateUserData";

export const checkUserDataMiddleware = async (
  ctx: Context,
  next: NextFunction,
) => {
  await next();

  const from = ctx.from;

  if (!from) return;

  const userData = await getUserFromDB(from.id);

  if (
    userData?.username !== from.username ||
    userData?.firstName !== from.first_name ||
    userData?.lastName !== from.last_name
  ) {
    await updateUserData(
      from.id,
      from.first_name,
      from.last_name || "",
      from.username || "",
    );
  }

  const mmoshData = await getLinkedUser(from.id);

  if (!mmoshData) {
    const link = generateLink(userData?.addressPublicKey!);
    const text =
      `Hey ${from.first_name}, it’s very important you verify your Telegram account. Telegram is a centralized messaging service. If you lose access your Telegram account for any reason, you can lose all the tokens in your Social Wallet. By verifying your Telegram account, you can retrieve your private key, link a separate Solana wallet and maintain control over the tokens in your Social Wallet.\n\nVerify your Telegram account on the MMOSH app by following this link:\n\n${link}`;

    await ctx.reply(text);
  }
};
