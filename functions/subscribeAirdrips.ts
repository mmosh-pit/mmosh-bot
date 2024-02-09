import { Context } from "grammy";
import { updateSubscriberPoints } from "../utils/airdrop";
import { getUserFromDB } from "../utils/users/getUserFromDB";

export const subscribeAirdrips = async (ctx: Context) => {
  if (!ctx.from) return;
  let text = "";
  let savedUser = await getUserFromDB(ctx.from.id);
  if (savedUser && savedUser._id && !savedUser.airdripSubscribe) {
    await updateSubscriberPoints(savedUser._id, 500);
    text = "500 points awarded";
  } else {
    text = "You have already subscribed to the Airdrips!";
  }
  await ctx.reply(text, {
    parse_mode: "Markdown",
  });
};
