import { Context } from "grammy";

export const showLink = async (ctx: Context) => {
  if (!ctx.from) return;
  const text = "Here is your activation link. Copy it and share far and wide…";
  await ctx.reply(text, {
    parse_mode: "Markdown",
  });
  await ctx.reply(`https://t.me/${process.env.BOT_NAME}?start=${ctx.from!.id}`);
};
