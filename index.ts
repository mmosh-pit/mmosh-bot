import { Bot, Context, session } from "grammy";
import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

import "dotenv/config";

import { run } from "@grammyjs/runner";
import { linkMMOSH } from "./functions/linkMMOSH";
import { connectApps } from "./functions/connectApps";
import { showMenu } from "./functions/showMenu";
import { firstAirdrip } from "./functions/firstAirdrip";
import { start } from "./functions/start";
import {
  checkTaskCompletion,
  startTasks,
  toggleNextTask,
} from "./functions/tasks";
import { showCheckBags } from "./functions/showCheckBags";
import { showDisplayLeaderboard } from "./functions/showDisplayLeaderboard";
import { showJoinGroup } from "./functions/showJoinGroup";
import { showSendTokens } from "./functions/showSendTokens";
import { showSwap } from "./functions/showSwap";
import { subscribeAirdrips } from "./functions/subscribeAirdrips";
import { showEarn } from "./functions/showEarn";
import { showAirdrop } from "./functions/showAirdrop";
import { joinAirdrip } from "./functions/joinAirdrip";
import { showClaimAirdrop } from "./functions/showClaimAirdrop";
import { showLink } from "./functions/showLink";
import { checkUserDataMiddleware } from "./middlewares/checkUserDataMiddleware";
import { checkForUserProfileNFT } from "./functions/checkForUserProfileNFT";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

const runner = run(bot);

bot.use(checkUserDataMiddleware);
bot.use(
  session({
    initial() {
      return {};
    },
  }),
);
bot.use(conversations());

bot.catch((error) => {
  console.log(error.message);
  console.log(error.stack);

  if (error.ctx.chat?.type === "group") return;

  const genericErrorMessage =
    "Sorry, something went wrong. Please try again later or communicate with Support";
  try {
    error.ctx.reply(genericErrorMessage);
  } catch (_) {}
});

const startLinkConversation = (
  conversation: MyConversation,
  ctx: MyContext,
) => {
  linkMMOSH(conversation, ctx, bot);
};

bot.use(createConversation(startLinkConversation));

bot.command("start", async (ctx) => {
  await start(ctx, bot);
});
bot.command("main", showMenu);
bot.command("bags", showCheckBags);
bot.command("send", showSendTokens);
bot.command("join", showJoinGroup);
bot.command("status", showDisplayLeaderboard);
bot.command("earn", showEarn);
bot.command("swap", showSwap);
bot.command("connect", connectApps);
bot.command("airdrop", showAirdrop);

bot.callbackQuery("main-menu", showMenu);
bot.callbackQuery("cancel-connect", showMenu);
bot.callbackQuery("mark-done", checkTaskCompletion);
bot.callbackQuery("next-task", toggleNextTask);
bot.callbackQuery("start-tasks", startTasks);
bot.callbackQuery("next-airdrop", showAirdrop);
bot.callbackQuery("claim-airdrop", showClaimAirdrop);
bot.callbackQuery("join-airdrip", joinAirdrip);
bot.callbackQuery("show-link", showLink);
bot.callbackQuery("subscribe-airdrips", subscribeAirdrips);
bot.callbackQuery("connect-app", connectApps);
bot.callbackQuery("done-connect", (ctx: MyContext) =>
  ctx.conversation.enter("startLinkConversation"),
);
bot.callbackQuery("first-airdrip", firstAirdrip);

bot.on("message", checkForUserProfileNFT);

bot.api.setMyCommands(
  [
    {
      command: "main",
      description: "Main Menu",
    },
    {
      command: "earn",
      description: "Earn Rewards",
    },
    {
      command: "bags",
      description: "Check Bags",
    },
    {
      command: "send",
      description: "Send Tokens",
    },
    {
      command: "swap",
      description: "Swap Tokens",
    },
    {
      command: "status",
      description: "Display Status",
    },
    {
      command: "join",
      description: "Join Group",
    },
    {
      command: "connect",
      description: "Connect Apps",
    },
    {
      command: "airdrop",
      description: "Claim Airdrop",
    },
  ],
  {
    scope: { type: "all_private_chats" },
  },
);

bot.api.setMyCommands(
  [
    {
      command: "earn",
      description: "Earn Rewards",
    },
    {
      command: "join",
      description: "Join Group",
    },
    {
      command: "airdrop",
      description: "Claim Airdrop",
    },
  ],
  {
    scope: { type: "all_group_chats" },
  },
);

const stopRunner = () => runner.isRunning() && runner.stop();

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
