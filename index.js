"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.winnerCounter = void 0;
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const createSolanaAddress_1 = require("./utils/web3/createSolanaAddress");
const getPrivateKeyBase58_1 = require("./utils/web3/getPrivateKeyBase58");
const getUserFromDB_1 = require("./utils/users/getUserFromDB");
const saveUserData_1 = require("./utils/users/saveUserData");
require("dotenv/config");
const updateAndSaveReferData_1 = require("./utils/users/updateAndSaveReferData");
const updateChatId_1 = require("./utils/users/updateChatId");
const airdrop_1 = require("./utils/airdrop");
const runner_1 = require("@grammyjs/runner");
const encryptData_1 = require("./utils/encryptData");
const updateUserData_1 = require("./utils/users/updateUserData");
const mongoConfig_1 = require("./config/mongoConfig");
const updateMMOSHData_1 = require("./utils/users/updateMMOSHData");
const getUserPoints_1 = require("./utils/users/getUserPoints");
const BOT_NAME = process.env.BOT_NAME;
const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
const webLink = process.env.WEB_LINK;
const maxWinnerCount = process.env.AIRDROP_MAX_COUNTER || "0";
exports.winnerCounter = 0;
let isMaxParticipation = false;
const bagsLink = `${webLink}/bags`;
const directoryUrl = `${process.env.WEB_LINK}/directory`;
const sendTokensUrl = `${process.env.WEB_LINK}/send_tokens`;
const swapTokensUrl = `${process.env.WEB_LINK}/swap_coins`;
// const setProfileUrl = `${process.env.WEB_LINK}/profile`;
const runner = (0, runner_1.run)(bot);
const checkUserDataMiddleware = async (ctx, next) => {
    await next();
    const from = ctx.from;
    if (!from)
        return;
    const userData = await (0, getUserFromDB_1.getUserFromDB)(from.id);
    if (userData?.username !== from.username ||
        userData?.firstName !== from.first_name ||
        userData?.lastName !== from.last_name) {
        await (0, updateUserData_1.updateUserData)(from.id, from.first_name, from.last_name || "", from.username || "");
    }
};
bot.use(checkUserDataMiddleware);
bot.use((0, grammy_1.session)({
    initial() {
        // return empty object for now
        return {};
    },
}));
bot.use((0, conversations_1.conversations)());
const buildMainMenuButtons = (id) => [
    [
        grammy_1.InlineKeyboard.text("Earn Rewards 🤑", "next-airdrop"),
        grammy_1.InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${id}`),
    ],
    [
        grammy_1.InlineKeyboard.webApp("Send Tokens 💸", `${sendTokensUrl}?user=${id}`),
        grammy_1.InlineKeyboard.webApp("Swap Tokens 🤝", `${swapTokensUrl}?user=${id}`),
    ],
    [
        grammy_1.InlineKeyboard.webApp("Display Status 🏆", `${directoryUrl}?user=${id}`),
        grammy_1.InlineKeyboard.url("Join Group 👋", `https://t.me/mmoshpit`),
    ],
    [grammy_1.InlineKeyboard.text("Connect Apps 🔐", "connect-app")],
];
const buildAirdropMenuButtons = (id) => [
    [
        // InlineKeyboard.text("Join Airdrip 💧", "join-airdrip"),
        grammy_1.InlineKeyboard.text("Show my Link 🔗", `show-link`),
    ],
];
bot.command("start", async (ctx) => {
    if (!ctx.from)
        return;
    try {
        const referrerId = ctx.message.text.replace("/start ", "");
        const waitText = "Wait for a moment to the bot to initialize...";
        const messageEntity = await ctx.reply(waitText);
        let savedUser = await (0, getUserFromDB_1.getUserFromDB)(ctx.from.id);
        const text = `Welcome to the MMOSH Pit! 👊\n\n👀 We’ve set up a secret hideout on the Solana network just for you.\n\n📬 Here’s the address:`;
        const secondText = `Just for joining, you can qualify for our monthly Dynamic Airdrops! You can also embark on quests, play games, join experiences, earn royalties, yield, rewards, merch and other goodies.\n\nComplete a few tasks to secure a big win in the MMOSH!`;
        const chat = await ctx.getChat();
        if (!savedUser) {
            const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);
            const newAddress = (0, createSolanaAddress_1.createSolanaAddress)();
            const photo = profilePhotos.photos[0];
            const file = photo
                ? photo[0]
                    ? await ctx.api.getFile(photo[0].file_id)
                    : { file_path: "" }
                : { file_path: "" };
            const pKey = (0, getPrivateKeyBase58_1.getPrivateKeyBase58)(newAddress.secretKey);
            const encryptedKey = (0, encryptData_1.encryptData)(pKey);
            const newUser = {
                addressPrivateKey: encryptedKey,
                addressPublicKey: newAddress.publicKey.toBase58(),
                bio: chat.bio || "",
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name || "",
                telegramId: ctx.from.id,
                username: ctx.from.username || "",
                image: file.file_path || "",
                referredUsers: 0,
                chatId: chat.id,
                isBot: ctx.from.is_bot,
                points: 0,
            };
            const insertedId = await (0, saveUserData_1.saveUserData)(newUser);
            if (referrerId) {
                const referrer = await (0, getUserFromDB_1.getUserFromDB)(Number(referrerId));
                if (referrer?._id) {
                    await (0, updateAndSaveReferData_1.updateAndSaveReferData)(referrer?._id, referrer?.telegramId, insertedId, ctx.from.id);
                    await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);
                    await bot.api.sendMessage(Number(referrerId), `Congratulations! ${newUser.firstName} activated on MMOSHbot from your link. You just earned 100 points that can be redeemed for $MMOSH, merch and more! Send them a [welcome message](https://t.me/${newUser.username}) so they feel at home.`, {
                        parse_mode: "Markdown",
                    });
                    await ctx.reply(`Congratulations! By following ${referrer.firstName}'s activation link, you earned 100 points that can be redeemed for $MMOSH, merch and more! Send them a [thank you message](https://t.me/${referrer.username}) for inviting you to MMOSH.`, {
                        parse_mode: "Markdown",
                    });
                    await ctx.reply("I’ve created your secret hideout in the MMOSH. Here’s the address:");
                    await ctx.reply(newUser.addressPublicKey);
                    await ctx.reply("Here is your personal Activation Link. Each time a friend activates their MMOSH account through this link, you’ll earn 100 more points!");
                    await ctx.reply(`https://t.me/MMOSHBot?start=${newUser.telegramId}`);
                    await ctx.reply("What would you like to do next?", {
                        reply_markup: {
                            inline_keyboard: buildMainMenuButtons(ctx.from.id),
                        },
                    });
                    return;
                }
            }
            savedUser = newUser;
        }
        if (!savedUser.chatId || savedUser.chatId !== chat.id) {
            await (0, updateChatId_1.updateChatId)(chat.id, savedUser._id);
        }
        await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);
        await ctx.reply(text);
        await ctx.reply(savedUser?.addressPublicKey || "");
        await ctx.reply(secondText, {
            reply_markup: {
                inline_keyboard: [
                    [grammy_1.InlineKeyboard.text("Let’s Win! 🏆", "start-tasks")],
                ],
            },
        });
    }
    catch (err) {
        if (err instanceof grammy_1.GrammyError) {
            console.log("Grammy error!");
            console.error(err);
        }
        if (err instanceof grammy_1.HttpError) {
            console.log("HTTP Error!");
            console.error(err);
        }
    }
});
const startTasks = async (ctx) => {
    const text = "Before you can become a full member of MMOSH DAO, you’ll need to register as a guest.\n\nWith our airdrops, giveaways and challenges, we want to make sure our most active, loyal and engaged community members are rewarded, while those annoying bots are left out in the cold.\n\nNow, let’s get started! Complete the tasks below to ensure you receive the biggest wins possible.\n\n(Please note: tasks will change frequently to give you more opportunities to earn points and win big. So stay tuned!)";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [grammy_1.InlineKeyboard.text("View Next Task 👀", "next-task")],
            ],
        },
    });
};
const toggleNextTask = async (ctx) => {
    await mmoshActivateTask(ctx);
};
const checkTaskCompletion = async (ctx) => {
    if (!ctx.from)
        return;
    const failedText = "I’m sorry, but it looks like this task is not yet complete. Try again, then mark it done";
    const isCompleted = await mongoConfig_1.db.collection("mmosh-app-profiles").findOne({
        "telegram.id": ctx.from.id,
    });
    if (!isCompleted) {
        await ctx.reply(failedText, {
            reply_markup: {
                inline_keyboard: [
                    [
                        grammy_1.InlineKeyboard.url("Register for the MMOSH ✍️", "https://mmosh.app"),
                        grammy_1.InlineKeyboard.text("Mark Done ✅", "mark-done"),
                    ],
                ],
            },
        });
        return;
    }
    await showCompletedText(ctx);
};
const showCompletedText = async (ctx) => {
    const text = `You did it! You’ve completed all the tasks.\n\nJust spectacular. You’ll all set for the magic and mayhem to come.\n\nJust remember, sharing your Activation Link is the fastest way to earn points and increase your chances of winning big.\n\nBut your points won’t count unless your referrals also complete the process and register as a guest.\n\nHere’s your Activation Link: https://t.me/MMOSHBot?start=${ctx.from.id}\n\nShare it far and wide!`;
    const lastText = "What would you like to do next?";
    await ctx.reply(text);
    await ctx.reply(lastText, {
        reply_markup: {
            inline_keyboard: buildMainMenuButtons(ctx.from.id),
        },
    });
};
const mmoshActivateTask = async (ctx) => {
    if (!ctx.from)
        return;
    const isCompleted = await mongoConfig_1.db.collection("mmosh-app-profiles").findOne({
        "telegram.id": ctx.from.id,
    });
    if (isCompleted) {
        await showCompletedText(ctx);
        return;
    }
    const text = "The MMOSH is for DAO members and guests only. Complete your registration to qualify and earn 350 points!";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.url("Register for the MMOSH ✍️", "https://mmosh.app"),
                    grammy_1.InlineKeyboard.text("Mark Done ✅", "mark-done"),
                ],
            ],
        },
    });
};
bot.catch((error) => {
    console.log(error.message);
    console.log(error.stack);
    const genericErrorMessage = "Sorry, something went wrong. Please try again later or communicate with Support";
    try {
        error.ctx.reply(genericErrorMessage);
    }
    catch (_) { }
});
const showMenu = async (ctx) => {
    const text = `👋 Hey! Let me know what you’d like to do next.`;
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: buildMainMenuButtons(ctx.from?.id || 0),
        },
    });
};
const showCheckBags = async (ctx) => {
    const text = "Curious about what you got in your bags? You’ve come to the right place!";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${ctx.from?.id}`),
                ],
            ],
        },
    });
};
const showDisplayLeaderboard = async (ctx) => {
    const text = "Where do you rank? Let’s display the status and find out.";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.webApp("Display Status 🏆", `${directoryUrl}?user=${ctx.from?.id}`),
                ],
            ],
        },
    });
};
const showSendTokens = async (ctx) => {
    const text = "Want to send money, coins, badges or NFTs? That’s easy! Just let me know what to send and where you want them to go.";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.webApp("Send Tokens 💸", `${sendTokensUrl}?user=${ctx.from?.id}`),
                ],
            ],
        },
    });
};
const showJoinGroup = async (ctx) => {
    const text = "Join our team and your fellow Liquid Hearts Club members in Visitors Center for guidance on getting the most out of your Social Wallet on Telegram.";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [grammy_1.InlineKeyboard.url("Join Group 👋", `https://t.me/mmoshpit`)],
            ],
        },
    });
};
const showAirdrop = async (ctx) => {
    if (!ctx.from)
        return;
    const text = "MMOSH offers dynamic rewards in the form of airdrops, points, giveaways, royalties and other incentives.\n\nRewards are based on your individual performance, participation in games and challenges and sometimes pure luck.\n\nIt all starts with sharing your Activation Link. Share it now to start earning points that can be swapped for $MMOSH, merch and more.";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: buildAirdropMenuButtons(ctx.from.id),
        },
    });
};
const joinAirdrip = async (ctx) => {
    if (!ctx.from)
        return;
    const text = "Welcome to Airdrip!\n\nIn advance of our massive Airdrop on January 11, 2024, we’re testing out our systems with a number of smaller Airdrips. Don’t confuse these Airdrips with our big launch Airdrop. These Airdrips are smaller, they’re designed to test our system, and they’re mostly for fun. But the money is real!\n\nIn each Airdrip, we’ll send out Airdrip Keys, followed by Airdrips of $MMOSH, $LOVE or other tokens a short time later.\n\nGold Key holders will receive 40% of the Airdrop pool.\n\nSilver Key holders will receive 30% of the Airdrop pool.\n\nBronze Key holders will receive 20% of the Airdrop pool.\n\nRed Key will receive 4% of the Airdrop pool.\n\nGreen Key will receive 3% of the Airdrop pool.\n\nBlack Key will receive 2% of the Airdrop pool.\n\nWhite Key will receive 1% of the Airdrop pool.\n\nEach Airdrip Key is for one Airdrip only. We will be holding several Airdrips between now and our big Airdrop.\n\nMake sure your bot notifications are on. Each time an Airdrip starts, the bot will message all Airdrip subscribers with the size of the rewards pool and the number of entries that will be accepted. Each Airdrip will be first-come, first-served and available for only a limited number of members.\n\nYou’ll receive 500 points for subscribing, and even if you don’t win an Airdrip Key, everyone who plays will earn 350 points!\n\n";
    await ctx.reply(text, {
        parse_mode: "Markdown",
    });
    await ctx.reply("Welcome to Airdrips… and good luck! 🍀", {
        reply_markup: {
            inline_keyboard: [
                [grammy_1.InlineKeyboard.text("Subscribe to Airdrips", `subscribe-airdrips`)],
            ],
        },
    });
    let savedUser = await (0, getUserFromDB_1.getUserFromDB)(ctx.from.id);
    if (savedUser && savedUser._id) {
        let isUserAlreadyWinner = await (0, airdrop_1.existsWinner)(savedUser.telegramId);
        if (!isUserAlreadyWinner) {
            if (exports.winnerCounter < parseInt(maxWinnerCount)) {
                exports.winnerCounter++;
                const newWinner = {
                    addressPublicKey: savedUser.addressPublicKey,
                    telegramId: savedUser.telegramId,
                };
                await (0, airdrop_1.saveAirdropWinnerData)(newWinner);
                await (0, airdrop_1.updatePoints)(savedUser._id, 350);
            }
        }
    }
};
const showLink = async (ctx) => {
    if (!ctx.from)
        return;
    const text = "Here is your activation link. Copy it and share far and wide…";
    await ctx.reply(text, {
        parse_mode: "Markdown",
    });
    await ctx.reply(`https://t.me/${BOT_NAME}?start=${ctx.from.id}`);
};
const subscribeAirdrips = async (ctx) => {
    if (!ctx.from)
        return;
    let text = "";
    let savedUser = await (0, getUserFromDB_1.getUserFromDB)(ctx.from.id);
    if (savedUser && savedUser._id && !savedUser.airdripSubscribe) {
        await (0, airdrop_1.updateSubscriberPoints)(savedUser._id, 500);
        text = "500 points awarded";
    }
    else {
        text = "You have already subscribed to the Airdrips!";
    }
    await ctx.reply(text, {
        parse_mode: "Markdown",
    });
};
const showSwap = async (ctx) => {
    if (!ctx.from)
        return;
    const text = "Want to swap tokens? You've come to the right place!";
    await ctx.reply(text, {
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.webApp("Swap Tokens 🤝", `${swapTokensUrl}?user=${ctx.from.id}`),
                ],
            ],
        },
    });
};
const showClaimAirdrop = async (ctx) => {
    if (!ctx.from)
        return;
    const text = "We’re launching our native token $MMOSH with a massive AIRDROP! $MMOSH will be listed on MEXC and Jupiter on January 23, 2024.\n\nA huge chunk of $MMOSH will be airdropped on January 11, 2024. Stay tuned to [@‌mmoshpit](https://t.me/mmoshpit) for details as we get closer to the event.\n\nHere’s how it works… the more points you collect, the greater your chance of winning big! Some quick facts:\n\n🏆11,111 airdrop winners will be chosen randomly! Winners will receive Airdrop Keys.\n\n🎟️You’ll get one chance at a Key for each point you earn, so even if you have only 1 point… you still have a chance to win. Think of these as raffle tickets. The more points you collect, the greater your chances!\n\n🔑There are 6 Airdrop Keys (Gold, Silver, Bronze, Red, Green & Black) that will be distributed randomly to winners. Each Key represents a different Airdrop amount.\n\n🏅Top prize is for a Gold Key  — an airdrop of over $1,000 in $MMOSH!\n\nWe’ll be sharing many ways you can earn points over the next few weeks. The best way to get started is by sharing your Activation Link. You’ll earn 100 points for every activation!\n\nHere is your activation link. Copy it and share far and wide…";
    await ctx.reply(text, {
        parse_mode: "Markdown",
    });
    await ctx.reply(`https://t.me/MMOSHBot?start=${ctx.from.id}`);
    await ctx.answerCallbackQuery();
};
// const firstAirdrip = async (ctx: Context) => {
//   if (!ctx.from) return;
//   let text = "You are not allowed to enroll for airdrip";
//   try {
//     if (!isMaxParticipation) {
//       let airdripInfo = await getAirdropInfo();
//       let savedUser = await getUserFromDB(ctx.from.id);
//       const airdripPoints = parseInt(process.env.AIRDRIP_POINTS || "350");
//       if (savedUser && savedUser._id) {
//         let isUserAlreadyWinner = await existsWinner(savedUser.telegramId);
//         const winnerCounter = await totalAirdropWinners();
//         if (!isUserAlreadyWinner) {
//           if (winnerCounter < parseInt(airdripInfo.numParticipants)) {
//             const newWinner = {
//               addressPublicKey: savedUser.addressPublicKey,
//               telegramId: savedUser.telegramId,
//             };
//             await saveAirdropWinnerData(newWinner);
//             await updatePoints(savedUser._id, airdripPoints);
//             text = "You successfully enrolled for first airdrip";
//             if (winnerCounter + 1 === parseInt(airdripInfo.numParticipants)) {
//               isMaxParticipation = true;
//               await performAirdrip(airdripInfo);
//             }
//           }
//         } else {
//           text = "You have already registered for the first airdrip";
//         }
//       }
//     } else {
//       text = "Sorry, maximum number of users have already enrolled";
//     }
//
//     await ctx.reply(text, {
//       parse_mode: "Markdown",
//     });
//     await ctx.answerCallbackQuery();
//   } catch (error) {
//     console.log(error);
//   }
// };
const askForSolanaWallet = async (conversation, ctx) => {
    const resp = await conversation.wait();
    const wallet = resp.message?.text || "";
    if (!resp.message) {
        showMenu(ctx);
        return true;
    }
    const user = await (0, getUserPoints_1.getUserPoints)(ctx.from.id);
    if (!user)
        return false;
    const isWalletValid = await (0, updateMMOSHData_1.updateMMOSHData)(wallet, {
        id: ctx.from.id,
        username: ctx.from.username || "",
        firstName: ctx.from.first_name,
        points: user.points || 0,
    });
    if (!isWalletValid) {
        await resp.reply("Sorry, I don’t see that address. Are you sure it’s the one you connected to your wallet? Please try again.");
        return await askForSolanaWallet(conversation, ctx);
    }
    await bot.api.sendMessage(ctx.chat.id, "Nicely done! You’ve successfully connected your Solana wallet to the MMOSH.\n\nPlease [return to the web app](https://www.mmosh.app) and complete your registration.", {
        parse_mode: "Markdown",
    });
    console.log("Finally returning");
    return true;
};
const linkMMOSH = async (conversation, ctx) => {
    if (!ctx.from)
        return;
    await ctx.reply("Next, To enter the Solana wallet address that you used to connect to the web app in the message field below, and send it here.", {
        reply_markup: {
            inline_keyboard: [[grammy_1.InlineKeyboard.text("Cancel ❌", "cancel-connect")]],
        },
    });
    await askForSolanaWallet(conversation, ctx);
    return;
};
const connectApps = async (ctx) => {
    await ctx.reply("Let’s connect your Telegram account to the MMOSH.\n\nFirst, please connect a Solana wallet to the [MMOSH web app](https://www.mmosh.app) and press the button when you’re done. We recommend Phantom, Solflare or Glow.", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    grammy_1.InlineKeyboard.text("Done ✅", "done-connect"),
                    grammy_1.InlineKeyboard.text("Main Menu 🪧", "main-menu"),
                ],
            ],
        },
    });
};
bot.use((0, conversations_1.createConversation)(linkMMOSH));
bot.command("main", showMenu);
bot.command("bags", showCheckBags);
bot.command("send", showSendTokens);
bot.command("join", showJoinGroup);
bot.command("status", showDisplayLeaderboard);
bot.command("earn", showAirdrop);
bot.command("swap", showSwap);
bot.command("connect", connectApps);
bot.callbackQuery("main-menu", showMenu);
bot.callbackQuery("mark-done", checkTaskCompletion);
bot.callbackQuery("next-task", toggleNextTask);
bot.callbackQuery("start-tasks", startTasks);
bot.callbackQuery("next-airdrop", showAirdrop);
bot.callbackQuery("claim-airdrop", showClaimAirdrop);
bot.callbackQuery("join-airdrip", joinAirdrip);
bot.callbackQuery("show-link", showLink);
bot.callbackQuery("subscribe-airdrips", subscribeAirdrips);
bot.callbackQuery("connect-app", connectApps);
bot.callbackQuery("done-connect", (ctx) => ctx.conversation.enter("linkMMOSH"));
// bot.callbackQuery("first-airdrip", firstAirdrip);
bot.api.setMyCommands([
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
]);
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
