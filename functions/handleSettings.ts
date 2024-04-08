import { Context, InlineKeyboard } from "grammy";

export async function handleSettings(ctx: Context) {
  if (!["group", "supergroup"].includes(ctx.chat?.type || "")) return;
  const bot = await ctx.getChatMember(ctx.me.id);
  const user = await ctx.getChatMember(ctx.from!.id);

  if (bot.status !== "administrator") {
    await ctx.reply(
      "You need to make me an admin in order to change this group settings!",
    );
    return;
  }

  if (!["administrator", "creator"].includes(user.status)) {
    await ctx.reply(
      "You need to be an admin in order to change this group settings!",
    );
    return;
  }

  const text =
    "Let's configure your bot's group settings, click the button to configure it through Private!";

  const botData = {
    user: ctx.from!.id,
    groupId: ctx.chat!.id,
    from: "group",
  };

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.text("Setup in Private", JSON.stringify(botData))],
      ],
    },
  });
}
