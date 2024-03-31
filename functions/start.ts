import {
  Api,
  Bot,
  Context,
  GrammyError,
  HttpError,
  InlineKeyboard,
  RawApi,
} from "grammy";
import { MyContext } from "../models/MyContext";
import { encryptData } from "../utils/encryptData";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { saveUserData } from "../utils/users/saveUserData";
import { updateAndSaveReferData } from "../utils/users/updateAndSaveReferData";
import { updateChatId } from "../utils/users/updateChatId";
import { createSolanaAddress } from "../utils/web3/createSolanaAddress";
import { getPrivateKeyBase58 } from "../utils/web3/getPrivateKeyBase58";
import { buildMainMenuButtons } from "./buildMainMenuButtons";

export const start = async (ctx: Context, bot: Bot<MyContext, Api<RawApi>>) => {
  if (!ctx.from) return;
  try {
    const referrerId = ctx.message?.text?.replace("/start ", "");

    const waitText = "Wait for a moment to the bot to initialize...";

    const messageEntity = await ctx.reply(waitText);

    let savedUser = await getUserFromDB(ctx.from.id);

    const text = `Welcome to the MMOSH Pit! 👊\n\n👀 We’ve set up a secret hideout on the Solana network just for you.\n\n📬 Here’s the address:`;

    const secondText = `Just for joining, you can qualify for our monthly Dynamic Airdrops! You can also embark on quests, play games, join experiences, earn royalties, yield, rewards, merch and other goodies.\n\nComplete a few tasks to secure a big win in the MMOSH!`;

    const chat = await ctx.getChat();

    if (!savedUser) {
      const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);

      const newAddress = createSolanaAddress();
      const photo = profilePhotos.photos[0];

      const file = photo
        ? photo[0]
          ? await ctx.api.getFile(photo[0].file_id)
          : { file_path: "" }
        : { file_path: "" };

      const pKey = getPrivateKeyBase58(newAddress.secretKey);
      const encryptedKey = encryptData(pKey);

      const newUser = {
        addressPrivateKey: encryptedKey,
        addressPublicKey: newAddress.publicKey.toBase58(),
        bio: (chat as any).bio || "",
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

      const insertedId = await saveUserData(newUser);
      if (referrerId) {
        const referrer = await getUserFromDB(Number(referrerId));

        if (referrer?._id) {
          await updateAndSaveReferData(
            referrer?._id,
            referrer?.telegramId,
            insertedId,
            ctx.from.id,
          );
          await bot.api.deleteMessage(
            messageEntity.chat.id,
            messageEntity.message_id,
          );

          await bot.api.sendMessage(
            Number(referrerId),
            `Congratulations! ${newUser.firstName} activated on MMOSHbot from your link. You just earned 100 points that can be redeemed for $MMOSH, merch and more! Send them a [welcome message](https://t.me/${newUser.username}) so they feel at home.`,
            {
              parse_mode: "Markdown",
            },
          );

          await ctx.reply(
            `Congratulations! By following ${referrer.firstName}'s activation link, you earned 100 points that can be redeemed for $MMOSH, merch and more! Send them a [thank you message](https://t.me/${referrer.username}) for inviting you to MMOSH.`,
            {
              parse_mode: "Markdown",
            },
          );

          await ctx.reply(
            "I’ve created your secret hideout in the MMOSH. Here’s the address:",
          );
          await ctx.reply(newUser.addressPublicKey);
          await ctx.reply(
            "Here is your personal Activation Link. Each time a friend activates their MMOSH account through this link, you’ll earn 100 more points!",
          );
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
      await updateChatId(chat.id, savedUser._id!);
    }

    await bot.api.deleteMessage(
      messageEntity.chat.id,
      messageEntity.message_id,
    );

    await ctx.reply(text);
    await ctx.reply(savedUser?.addressPublicKey || "");
    await ctx.reply(secondText, {
      reply_markup: {
        inline_keyboard: [
          [InlineKeyboard.text("Let’s Win! 🏆", "start-tasks")],
        ],
      },
    });
  } catch (err) {
    if (err instanceof GrammyError) {
      console.log("Grammy error!");
      console.error(err);
    }
    if (err instanceof HttpError) {
      console.log("HTTP Error!");
      console.error(err);
    }
  }
};
