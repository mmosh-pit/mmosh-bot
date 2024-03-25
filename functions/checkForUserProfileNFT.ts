import { Context } from "grammy";
import { Connectivity } from "mmoshcore";
import { decryptData } from "../utils/decryptData";
import { getUserFromDB } from "../utils/users/getUserFromDB";

export async function checkForUserProfileNFT(ctx: Context) {
  if (ctx.from?.is_bot) return;

  if (ctx.message?.chat.type === "group") {
    if (ctx.message!.new_chat_members) {
      for (const member of ctx.message!.new_chat_members) {
        if (member.is_bot) continue;

        const userInfo = await getUserFromDB(member.id);

        if (!userInfo) {
          ctx.banChatMember(member.id);
          continue;
        }

        const decryptedKey = decryptData(userInfo.addressPrivateKey);

        const connectivity = new Connectivity(
          process.env.SOLANA_CLUSTER!,
          decryptedKey,
          process.env.PROGRAM_ID!,
        );

        const userWalletInfo = await connectivity.getUserInfo();

        if (userWalletInfo.profiles.length === 0) {
          console.log("REMOVING: ", member);
          ctx.banChatMember(member.id);
          continue;
        }
      }
    }
  }
}
