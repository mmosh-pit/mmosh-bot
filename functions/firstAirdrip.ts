import { Context } from "grammy";
import {
  existsWinner,
  getAirdropInfo,
  saveAirdropWinnerData,
  totalAirdropWinners,
  updatePoints,
} from "../utils/airdrop";
import { performAirdrip } from "../utils/performAirdrip";
import { getUserFromDB } from "../utils/users/getUserFromDB";

let isMaxParticipation = false;

export const firstAirdrip = async (ctx: Context) => {
  if (!ctx.from) return;
  let text = "You are not allowed to enroll for airdrip";
  console.log("Is max participation: ", isMaxParticipation);
  let airdripInfo = await getAirdropInfo();
  let savedUser = await getUserFromDB(ctx.from.id);
  const airdripPoints = parseInt(process.env.AIRDRIP_POINTS || "350");

  console.log("1");
  if (savedUser && savedUser._id) {
    let isUserAlreadyWinner = await existsWinner(savedUser.telegramId);
    const winnerCounter = await totalAirdropWinners();
    console.log("Is user already winner ", isUserAlreadyWinner);

    if (!isUserAlreadyWinner) {
      if (winnerCounter < parseInt(airdripInfo.numParticipants)) {
        const newWinner = {
          addressPublicKey: savedUser.addressPublicKey,
          telegramId: savedUser.telegramId,
        };
        await saveAirdropWinnerData(newWinner);
        await updatePoints(savedUser._id, airdripPoints);
        text = "You successfully enrolled for first airdrip";

        console.log("WinnerCounter: ", winnerCounter);
        console.log("Airdrip info: ", airdripInfo);

        if (winnerCounter + 1 === parseInt(airdripInfo.numParticipants)) {
          console.log("Going to perform Airdrip");
          isMaxParticipation = true;
          await performAirdrip(airdripInfo);
        }
      } else {
        text = "Sorry, maximum number of users have already enrolled";
      }
    } else {
      console.log("WinnerCounter: ", winnerCounter);
      console.log("Airdrip info: ", airdripInfo);
      if (winnerCounter === parseInt(airdripInfo.numParticipants)) {
        console.log("Going to perform Airdrip");
        isMaxParticipation = true;
        await performAirdrip(airdripInfo);
      } else {
        text = "You have already registered for the first airdrip";
      }
    }
  }

  await ctx.reply(text, {
    parse_mode: "Markdown",
  });
  await ctx.answerCallbackQuery();
};
