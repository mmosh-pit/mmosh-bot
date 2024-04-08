import { InlineKeyboard } from "grammy";
import { MyContext } from "../models/MyContext";

export async function askTypeOfToken(
  ctx: MyContext,
  userId: number,
  username: string,
  groupId: string,
) {
  const message = {
    groupId,
    from: "private",
  };

  await ctx.api.sendMessage(
    userId,
    `Group to configure: ${username}\n\n Please select the type of token you would like to use as the Token Gating rule`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            InlineKeyboard.text(
              "Passes",
              JSON.stringify({ ...message, token: "passes" }),
            ),
            InlineKeyboard.text(
              "Profiles",
              JSON.stringify({ ...message, token: "profiles" }),
            ),
            InlineKeyboard.text(
              "Badges",
              JSON.stringify({ ...message, token: "badges" }),
            ),
            InlineKeyboard.text(
              "Coins",
              JSON.stringify({ ...message, token: "coins" }),
            ),
          ],
        ],
      },
    },
  );
}
