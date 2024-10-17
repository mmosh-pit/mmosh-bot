import { Context } from "grammy";

export async function handleHelp(ctx: Context) {
  await ctx.reply(
    "Liquid Hearts Club is a Telegram bot and Web3 app where you can form deeper relationships, join and build supportive communities and collaborate on significant and rewarding projects.\nGo to @LiquidHeartsSupport for live, 24/7 assistance from our Liquid Hearts Guides.\nGo to https://www.liquidhearts.club for training.",
    {
      parse_mode: "Markdown",
    },
  );
}
