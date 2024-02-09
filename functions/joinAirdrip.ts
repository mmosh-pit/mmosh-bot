import { Context, InlineKeyboard } from "grammy";
import {
  existsWinner,
  saveAirdropWinnerData,
  updatePoints,
} from "../utils/airdrop";
import { getUserFromDB } from "../utils/users/getUserFromDB";

const maxWinnerCount: string = process.env.AIRDROP_MAX_COUNTER || "0";

let winnerCounter: number = 0;

export const joinAirdrip = async (ctx: Context) => {
  if (!ctx.from) return;
  const text =
    "Welcome to Airdrip!\n\nIn advance of our massive Airdrop on January 11, 2024, we’re testing out our systems with a number of smaller Airdrips. Don’t confuse these Airdrips with our big launch Airdrop. These Airdrips are smaller, they’re designed to test our system, and they’re mostly for fun. But the money is real!\n\nIn each Airdrip, we’ll send out Airdrip Keys, followed by Airdrips of $MMOSH, $LOVE or other tokens a short time later.\n\nGold Key holders will receive 40% of the Airdrop pool.\n\nSilver Key holders will receive 30% of the Airdrop pool.\n\nBronze Key holders will receive 20% of the Airdrop pool.\n\nRed Key will receive 4% of the Airdrop pool.\n\nGreen Key will receive 3% of the Airdrop pool.\n\nBlack Key will receive 2% of the Airdrop pool.\n\nWhite Key will receive 1% of the Airdrop pool.\n\nEach Airdrip Key is for one Airdrip only. We will be holding several Airdrips between now and our big Airdrop.\n\nMake sure your bot notifications are on. Each time an Airdrip starts, the bot will message all Airdrip subscribers with the size of the rewards pool and the number of entries that will be accepted. Each Airdrip will be first-come, first-served and available for only a limited number of members.\n\nYou’ll receive 500 points for subscribing, and even if you don’t win an Airdrip Key, everyone who plays will earn 350 points!\n\n";
  await ctx.reply(text, {
    parse_mode: "Markdown",
  });
  await ctx.reply("Welcome to Airdrips… and good luck! 🍀", {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.text("Subscribe to Airdrips", `subscribe-airdrips`)],
      ],
    },
  });
  let savedUser = await getUserFromDB(ctx.from.id);
  if (savedUser && savedUser._id) {
    let isUserAlreadyWinner = await existsWinner(savedUser.telegramId);
    if (!isUserAlreadyWinner) {
      if (winnerCounter < parseInt(maxWinnerCount)) {
        winnerCounter++;
        const newWinner = {
          addressPublicKey: savedUser.addressPublicKey,
          telegramId: savedUser.telegramId,
        };
        await saveAirdropWinnerData(newWinner);
        await updatePoints(savedUser._id, 350);
      }
    }
  }
};
