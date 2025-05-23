import {
  Api,
  Bot,
  Context,
  GrammyError,
  HttpError,
  InlineKeyboard,
  RawApi,
} from "grammy";
import { DBUser } from "../models/DBUser";
import { MyContext } from "../models/MyContext";
import { addTelegramToUser } from "../utils/users/addTelegramToUser";
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

      const newUser = {
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

      if (incomingWalletAddress) {
        await addTelegramToUser(ctx.from.id, incomingWalletAddress);
        await bot.api.deleteMessage(
          messageEntity.chat.id,
          messageEntity.message_id,
        );

        const text = `Congrats! You have activated your Telegram account with your recently created Web Account.\n You can choose what to do now in the following buttons!`;

        await ctx.reply(text, {
          reply_markup: {
            inline_keyboard: buildMainMenuButtons(ctx.from.id),
          },
        });

        return;
      }

      const insertedId = await saveUserData(newUser);

      let referrerUser: DBUser | null;

      if (referrerId) {
        const referrer = await getUserByProfileAddress(referrerId);

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
        }
      }

      const text = `Hey there! To continue your registration to the LHC, please create an account in our website, by clicking into the next button!`;

      await ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [
            [
              InlineKeyboard.webApp(
                "Register",
                `${process.env.WEB_LINK}/auth?refer=${referrerId}&user=${ctx.from.id}`,
              ),
            ],
          ],
        },
      });

      savedUser = newUser;

      await bot.api.deleteMessage(
        messageEntity.chat.id,
        messageEntity.message_id,
      );

      return;
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
