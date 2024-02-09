import { Context } from "grammy";
import { buildAirdropMenuButtons } from "./buildAirdropMenuButtons";

export const showAirdrop = async (ctx: Context) => {
  if (!ctx.from) return;
  const text =
    "MMOSH Airdrop | Liquid Hearts Club ❤️‍🔥\n\nWe’re launching our native token $MMOSH with a massive AIRDROP before $MMOSH is listed on major exchanges on January 23, 2024. Stay tuned to the Airdrop post and Announcements section of our Telegram group for details as we get closer to the event.\n\nSo here’s how it works… the more points you collect, the greater your chance of winning big! Some quick facts: \n\n🏆11,111 airdrop winners will be chosen randomly! Winners will receive Airdrop Keys.\n\n🎲You’ll get one chance at a Key for each point you earn, so even if you have only 1 point… you’ll still have a chance to win. But the more points you collect, the greater your chances!\n\n🔑There are 7 Airdrop Keys (Gold, Silver, Bronze, Red, Green, Black & White) that will be distributed randomly to winners. Each Key represents a different Airdrop amount. Everyone who qualifies will receive at least one key!\n\n🏅Top prize is for a Gold Key  — an airdrop of over $1,000 in $MMOSH!\n\nWe’ll be sharing many ways you can earn points over the next few weeks. Two great ways to get started stacking points and snagging $MMOSH are right here.\n\nJoin our Airdrips, which are smaller and more frequent $MMOSH airdrops, and share your Activation link far and wide!\n\n";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildAirdropMenuButtons(ctx.from.id),
    },
  });
};
