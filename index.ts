import { Bot, InlineKeyboard, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import axios from "axios";

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
import { handleSettings } from "./functions/handleSettings";
import { sendSettingsMessage } from "./functions/sendSettingsMessage";
import { MyContext } from "./models/MyContext";
import { MyConversation } from "./models/MyConversation";
import { askTypeOfToken } from "./functions/askTypeOfToken";
import { saveGroupTokenGatingInfo } from "./utils/groups/saveGroupTokenGatingInfo";
import { Chat } from "grammy/types";
import { updateGroupTokenGatingInfo } from "./utils/groups/updateGroupTokenGatingInfo";
import { PublicKey } from "@solana/web3.js";
import { handleVerify } from "./functions/handleVerify";
import { handleHelp } from "./functions/handleHelp";
import { handleCoins } from "./functions/handleCoins";
import { handleCommunities } from "./functions/handleCommunities";
import { handleMembers } from "./functions/handleMembers";
import { handleRewards } from "./functions/handleRewards";
import { handleAtm } from "./functions/handleAtm";
import { handleProfile } from "./functions/handleMyProfile";
import { handleJoinTheClub } from "./functions/handleJoinTheClub";

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

const startTokenGatingConversation = async (
  conversation: MyConversation,
  ctx: MyContext,
) => {
  const groupId = ctx.groupId;
  const res = ctx.tokenType;

  let text = "";
  let tokenType = "";

  switch (res) {
    case "passes": {
      text = `Please enter the collection address for the ${res} that you want to configure as a Token Gating Rule! Make sure is a valid address`;
      tokenType = "nft";
      break;
    }
    case "profiles": {
      text = `Please enter the collection address for the ${res} that you want to configure as a Token Gating Rule! Make sure is a valid address`;
      tokenType = "nft";
      break;
    }
    case "badges": {
      text =
        "Please enter the collection address for the badges that you want to configure as a Token Gating Rule! Make sure is a valid address";
      tokenType = "sft";
      break;
    }
    case "coins": {
      text =
        "Please enter the token address for the coin that you want to configure as a Token Gating Rule! Make sure is a valid address";
      tokenType = "coin";
      break;
    }

    default: {
      break;
    }
  }

  const cancelButton = InlineKeyboard.text("Cancel ❌", "cancel-connect");

  let address: string | undefined;

  do {
    await ctx.reply(text, {
      reply_markup: {
        inline_keyboard: [[cancelButton]],
      },
    });
    const { message } = await conversation.wait();

    if (!message) break;

    try {
      if (PublicKey.isOnCurve(message?.text || "")) {
        address = message?.text;
      }
    } catch (_) {}
  } while (!address);

  if (!address) {
    showMenu(ctx);
    return;
  }

  let amount = 0;

  if (tokenType === "coin" || tokenType === "sft") {
    do {
      await ctx.reply(
        "Please enter the amount of tokens that User needs to have to join the group! Should be a positive integer",
        {
          reply_markup: {
            inline_keyboard: [[cancelButton]],
          },
        },
      );
      const { message } = await conversation.wait();

      if (!message) break;

      const res = Number(message!.text);

      if (!Number.isNaN(res) && res > 0) {
        amount = res;
      }
    } while (amount === 0);
  } else {
    amount = 1;
  }

  if (!amount || amount === 0) {
    showMenu(ctx);
    return;
  }

  await conversation.external(() =>
    updateGroupTokenGatingInfo(
      groupId,
      ctx.from!.id,
      address!,
      tokenType,
      amount,
    ),
  );

  await ctx.reply("Your rules for accessing your group are now set!");
};

bot.use(createConversation(startLinkConversation));
bot.use(
  createConversation(startTokenGatingConversation, {
    id: "token-gating-conversation",
  }),
);

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
bot.command("settings", handleSettings);
bot.command("verify", handleVerify);
bot.command("help", handleHelp);
bot.command("coins", handleCoins);
bot.command("communities", handleCommunities);
bot.command("members", handleMembers);
bot.command("rewards", handleRewards);
bot.command("atm", handleAtm);
bot.command("profile", handleProfile);
bot.command("join", handleJoinTheClub);

bot.callbackQuery("verify", handleVerify);
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
bot.callbackQuery("setup-settings", sendSettingsMessage);

bot.on("callback_query:data", async (ctx) => {
  const data = JSON.parse(ctx.callbackQuery.data);

  if (data.from === "group") {
    if (ctx.from.id !== data.user) return;

    const group = (await ctx.api.getChat(data.groupId)) as Chat.SupergroupChat;
    await saveGroupTokenGatingInfo(
      data.groupId,
      group.username || group.title,
      ctx.from.id,
    );
    await askTypeOfToken(
      ctx,
      ctx.from.id,
      group.username || group.title,
      data.groupId,
    );
    await ctx.deleteMessage();
    ctx.answerCallbackQuery();
    return;
  }

  if (data.from === "private") {
    ctx.tokenType = data.token;
    ctx.groupId = data.groupId;
    await ctx.conversation.enter("token-gating-conversation");
    return;
  }
});
let bot_name = "";

bot.api
  .getMe()
  .then((botInfo) => {
    console.log("Bot name:", botInfo.first_name);
    bot_name = botInfo.first_name;
  })
  .catch((error) => {
    console.error("Error fetching bot info:", error);
  });

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  const username = ctx.from.id ? ctx.from.id : "unknown_user";

  //const apiUrl = "http://localhost:8080/generate/";
  const apiUrl = "https://mmoshapi-uodcouqmia-uc.a.run.app/generate/";
  const postData = {
    prompt: text,
    username: String(username),
    botname: bot_name,
  };

  try {
    // Perform the POST request using axios
    const response = await axios.post(apiUrl, postData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    //await ctx.reply(response.data);

    const geminiResponse = response.data;

    switch (geminiResponse) {
      case "/start":
        await start(ctx, bot);
        break;
      case "/earn":
        showEarn(ctx);
        break;
      case "/status":
        showDisplayLeaderboard(ctx);
        break;
      case "/main":
        showMenu(ctx);
        break;
      case "/bags":
        showCheckBags(ctx);
        break;
      case "/connect":
        connectApps(ctx);
        break;
      case "/settings":
        handleSettings(ctx);
        break;
      case "/join":
        showJoinGroup(ctx);
      default:
        await ctx.reply(geminiResponse);
    }
  } catch (error) {
    console.error("Failed to fetch from API:", error);
    await ctx.reply("There was an error processing your request.");
  }
});

bot.on("message", checkForUserProfileNFT);

bot.api.setMyCommands(
  [
    {
      command: "main",
      description: "Main Menu",
    },
    // {
    //   command: "earn",
    //   description: "Earn Rewards",
    // },
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
    // {
    //   command: "status",
    //   description: "Display Status",
    // },
    // {
    //   command: "join",
    //   description: "Join Group",
    // },
    // {
    //   command: "connect",
    //   description: "Connect Apps",
    // },
    // {
    //   command: "airdrop",
    //   description: "Claim Airdrop",
    // },
    {
      command: "coins",
      description: "Coins",
    },

    {
      command: "communities",
      description: "Communities",
    },
    {
      command: "members",
      description: "Members",
    },

    {
      command: "rewards",
      description: "Rewards",
    },

    {
      command: "atm",
      description: "ATM",
    },

    {
      command: "profile",
      description: "My Profile",
    },
    {
      command: "settings",
      description: "Settings",
    },
    {
      command: "join",
      description: "Join the Club",
    },
    {
      command: "help",
      description: "Get Help",
    },
  ],
  {
    scope: { type: "all_private_chats" },
  },
);

bot.api.setMyCommands(
  [
    {
      command: "settings",
      description: "Setup bot group settings",
    },
  ],
  {
    scope: { type: "all_chat_administrators" },
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
