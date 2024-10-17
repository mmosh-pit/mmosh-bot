import { Context, InlineKeyboard } from "grammy";
import { communitiesUrl } from "./buildMainMenuButtons";

export const handleCommunities = async (ctx: Context) => {
  if (!ctx.from) return;
  const text =
    "View the Communities created by Liquid Hearts Club members. Get started by joining our official Liquid Hearts Club group, [@LiquidHeartsOfficial](https://t.me/liquidheartsapp).";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.webApp(
            "Communities",
            `${communitiesUrl}?user=${ctx.from.id}`,
          ),
        ],
      ],
    },
    parse_mode: "Markdown",
  });
};
