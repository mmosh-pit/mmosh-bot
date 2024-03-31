import { Context, InlineKeyboard } from "grammy";

export async function handleSettings(ctx: Context) {
  const text =
    "Let's configure your bot's group settings, click the button to configure it through Private!";

  const botData = {
    bot_id: ctx.chat!.id,
  };

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [[
        InlineKeyboard.text("Setup in Private", JSON.stringify(botData)),
      ]],
    },
  });
}
