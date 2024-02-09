import { Context, InlineKeyboard } from "grammy";
import { db } from "../config/mongoConfig";
import { buildMainMenuButtons } from "./buildMainMenuButtons";

export const startTasks = async (ctx: Context) => {
  const text =
    "Before you can become a full member of MMOSH DAO, you’ll need to register as a guest.\n\nWith our airdrops, giveaways and challenges, we want to make sure our most active, loyal and engaged community members are rewarded, while those annoying bots are left out in the cold.\n\nNow, let’s get started! Complete the tasks below to ensure you receive the biggest wins possible.\n\n(Please note: tasks will change frequently to give you more opportunities to earn points and win big. So stay tuned!)";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [InlineKeyboard.text("View Next Task 👀", "next-task")],
      ],
    },
  });
};

export const toggleNextTask = async (ctx: Context) => {
  await mmoshActivateTask(ctx);
};

export const checkTaskCompletion = async (ctx: Context) => {
  if (!ctx.from) return;

  const failedText =
    "I’m sorry, but it looks like this task is not yet complete. Try again, then mark it done";

  const isCompleted = await db.collection("mmosh-app-profiles").findOne({
    "telegram.id": ctx.from.id,
  });

  if (!isCompleted) {
    await ctx.reply(failedText, {
      reply_markup: {
        inline_keyboard: [
          [
            InlineKeyboard.url(
              "Register for the MMOSH ✍️",
              "https://mmosh.app",
            ),
            InlineKeyboard.text("Mark Done ✅", "mark-done"),
          ],
        ],
      },
    });
    return;
  }

  await showCompletedText(ctx);
};

const showCompletedText = async (ctx: Context) => {
  const text = `You did it! You’ve completed all the tasks.\n\nJust spectacular. You’ll all set for the magic and mayhem to come.\n\nJust remember, sharing your Activation Link is the fastest way to earn points and increase your chances of winning big.\n\nBut your points won’t count unless your referrals also complete the process and register as a guest.\n\nHere’s your Activation Link: https://t.me/MMOSHBot?start=${ctx.from!.id}\n\nShare it far and wide!`;
  const lastText = "What would you like to do next?";

  await ctx.reply(text);
  await ctx.reply(lastText, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from!.id),
    },
  });
};

const mmoshActivateTask = async (ctx: Context) => {
  if (!ctx.from) return;

  const isCompleted = await db.collection("mmosh-app-profiles").findOne({
    "telegram.id": ctx.from.id,
  });

  if (isCompleted) {
    await showCompletedText(ctx);
    return;
  }

  const text =
    "The MMOSH is for DAO members and guests only. Complete your registration to qualify and earn 350 points!";

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: [
        [
          InlineKeyboard.url("Register for the MMOSH ✍️", "https://mmosh.app"),
          InlineKeyboard.text("Mark Done ✅", "mark-done"),
        ],
      ],
    },
  });
};
