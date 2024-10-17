import { Context, InlineKeyboard } from "grammy";
import { getUserLinkedWallet } from "../utils/users/getUserLinkedWallet";
import { rewardsUrl } from "./buildMainMenuButtons";

export const handleRewards = async (ctx: Context) => {
  if (!ctx.from) return;
  let text = `Earn rewards for creating coins, building community and joining projects.`;

  const userData = await getUserLinkedWallet(ctx.from.id);

  if (userData) {
    text += `The fastest way to earn rewards is by sharing your Liquid Hearts Bot Telegram activation link:\nhttps://t.me/${process.env.BOT_NAME}?start=${userData!.profilenft}`;
  }

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.webApp("Coins", `${rewardsUrl}?user=${ctx.from.id}`)],
      ],
    },
  });
};
