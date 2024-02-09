import { Context } from "grammy";
import { buildAirdropMenuButtons } from "./buildAirdropMenuButtons";

export const showEarn = async (ctx: Context) => {
  if (!ctx.from) return;
  const text =
    "MMOSH offers dynamic rewards in the form of airdrops, points, giveaways, royalties and other incentives.\n\nRewards are based on your individual performance, participation in games and challenges and sometimes pure luck.\n\nIt all starts with sharing your Activation Link. Share it now to start earning points that can be swapped for $MMOSH, merch and more.";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildAirdropMenuButtons(ctx.from.id),
    },
  });
};
