import { Context } from "grammy";

type ExtendedChat = {
  id: number;
  type: string;
  title: string;
  username: string;
};

export async function sendSettingsMessage(ctx: Context) {
  if (!["supergroup", "group"].includes(ctx.chat?.type || "")) {
    await ctx.reply("Command only supported on Groups!");
    return;
  }

  const chatUsername = (ctx.chat! as ExtendedChat).username;

  const text =
    `Hey, you want to change the token-gating settings on ${chatUsername} group, hit the button to start configuring!`;

  await ctx.api.sendMessage(ctx.from!.id, text);
  await ctx.answerCallbackQuery();
}
