import { Api, Bot, Context, GrammyError, HttpError, RawApi } from "grammy";
import { DBUser } from "../models/DBUser";
import { MyContext } from "../models/MyContext";
import { generateWallet } from "../utils/generateWallet";
import { generateLink } from "../utils/users/generateLink";
import { getLinkedUser } from "../utils/users/getLinkedUser";
import { getReferredUser } from "../utils/users/getReferredUser";
import { getUserByProfileAddress } from "../utils/users/getUserByProfileAddress";
import { getUserByWallet } from "../utils/users/getUserByWallet";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { saveUserData } from "../utils/users/saveUserData";
import { updateAndSaveReferData } from "../utils/users/updateAndSaveReferData";
import { updateChatId } from "../utils/users/updateChatId";
import { buildMainMenuButtons } from "./buildMainMenuButtons";

export const start = async (ctx: Context, bot: Bot<MyContext, Api<RawApi>>) => {
  if (!ctx.from) return;
  try {
    let referrerId =
      ctx.message?.text?.replace("/start", "") ||
      process.env.NEXT_PUBLIC_GENESIS_PROFILE!;

    let incomingWalletAddress = "";

    if (referrerId.includes(",")) {
      const splitted = referrerId.split(",");
      incomingWalletAddress = splitted[splitted.length - 1];

      referrerId = splitted[0];
    }

    const waitText = "Wait for a moment to the bot to initialize...";

    const messageEntity = await ctx.reply(waitText);

    let savedUser = await getUserFromDB(ctx.from.id);

    const chat = await ctx.getChat();

    if (!savedUser) {
      const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);

      const photo = profilePhotos.photos[0];

      const file = photo
        ? photo[0]
          ? await ctx.api.getFile(photo[0].file_id)
          : { file_path: "" }
        : { file_path: "" };

      const wallet = await generateWallet(incomingWalletAddress);

      const newUser = {
        addressPrivateKey: wallet.pKey,
        addressPublicKey: wallet.address,
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

      let referrerUser: DBUser | null;

      if (referrerId) {
        const referrer = await getUserByProfileAddress(referrerId);
        const mmoshReferrerData = await getLinkedUser(Number(referrerId));

        if (referrer) {
          referrerUser = await getUserByWallet(referrer.wallet);

          if (referrerUser) {
            await updateAndSaveReferData(
              referrerUser._id!,
              referrer.telegram.id,
              insertedId,
              ctx.from.id,
            );
          }

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

          let message = "";

          if (referrer.profilenft) {
            message = `We’ve dropped a courtesy Invitation to join the DAO from you into ${newUser.firstName}’s Social Wallet. If they mint a Profile, they’ll join your Guild and you’ll earn royalties from some of their mints and trades.`;
          } else {
            message =
              "Don’t forget to mint a Profile NFT to become a member of MMOSH DAO. As a member, you can build up your Guild and receive royalties when your Guild members join Communities!";
          }

          await bot.api.sendMessage(Number(referrerId), message);
          await bot.api.sendMessage(
            Number(referrerId),
            `${newUser.firstName}'s Social Wallet address is:\n\n${newUser.addressPublicKey}\n\nYou can send them invitations to join communities and Coins to get them started on the MMOSH!`,
          );

          if (!mmoshReferrerData) {
            const link = await generateLink(referrerUser?.addressPublicKey!);
            await bot.api.sendMessage(
              Number(referrerId),
              `Next, earn 250 points for verifying your Telegram account by following this link: ${link}\nThis is an important step to protect your tokens in the event you lose access to your Telegram account.`,
            );
          }

          const firstText = `Welcome to the MMOSH! 👊\n\nBy joining us through ${referrerUser?.firstName}’s activation link, you earned 100 Points that can be redeemed for $MMOSH, merch and more! Send them [a thank you message](https://t.me/${referrerUser?.telegramId}) for inviting you to MMOSH.`;

          const lastText = `Here’s the address of your new Social Wallet:\n\n${newUser.addressPublicKey}\n\nTo learn more about all the wholesome goodness provided by this bot, just ask me a question in the message field or select one of the buttons below, which are available from the /main menu at any time:`;

          await ctx.reply(firstText);

          await ctx.reply(lastText, {
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

    const referredUser = await getReferredUser(savedUser._id!);

    const text = `Welcome back to the MMOSH! 👊\n\nYou were originally invited through ${referredUser?.firstName}’s activation link. You can reach them [by direct message here](https://t.me/${referredUser?.username}).\n\nAs a reminder, here’s the address of your new Social Wallet:\n\n${savedUser.addressPublicKey}\n\nTo learn more about all the wholesome goodness provided by this bot, just ask me a question in the message field or select one of the buttons below, which are available from the /main menu at any time:`;

    await ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buildMainMenuButtons(ctx.from.id),
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
