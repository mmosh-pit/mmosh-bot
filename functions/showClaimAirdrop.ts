import { Context } from "grammy";

export const showClaimAirdrop = async (ctx: Context) => {
  if (!ctx.from) return;

  const text =
    "We’re launching our native token $MMOSH with a massive AIRDROP! $MMOSH will be listed on MEXC and Jupiter on January 23, 2024.\n\nA huge chunk of $MMOSH will be airdropped on January 11, 2024. Stay tuned to [@‌mmoshpit](https://t.me/mmoshpit) for details as we get closer to the event.\n\nHere’s how it works… the more points you collect, the greater your chance of winning big! Some quick facts:\n\n🏆11,111 airdrop winners will be chosen randomly! Winners will receive Airdrop Keys.\n\n🎟️You’ll get one chance at a Key for each point you earn, so even if you have only 1 point… you still have a chance to win. Think of these as raffle tickets. The more points you collect, the greater your chances!\n\n🔑There are 6 Airdrop Keys (Gold, Silver, Bronze, Red, Green & Black) that will be distributed randomly to winners. Each Key represents a different Airdrop amount.\n\n🏅Top prize is for a Gold Key  — an airdrop of over $1,000 in $MMOSH!\n\nWe’ll be sharing many ways you can earn points over the next few weeks. The best way to get started is by sharing your Activation Link. You’ll earn 100 points for every activation!\n\nHere is your activation link. Copy it and share far and wide…";
  await ctx.reply(text, {
    parse_mode: "Markdown",
  });
  await ctx.reply(`https://t.me/MMOSHBot?start=${ctx.from.id}`);
  await ctx.answerCallbackQuery();
};
