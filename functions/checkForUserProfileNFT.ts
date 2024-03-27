import { Context } from "grammy";
import { Connectivity } from "mmoshcore";
import { decryptData } from "../utils/decryptData";
import { getUserFromDB } from "../utils/users/getUserFromDB";

export async function checkForUserProfileNFT(ctx: Context) {
  console.log("Got message")
  if (ctx.from?.is_bot) return;

  const isGroup = ctx.message?.chat.type === "group";
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  console.log("Chat type: ", ctx.message?.chat.type);
  if (isGroup || isSupergroup) {
    console.log("Checking...")
    if (ctx.message!.new_chat_members) {
      console.log("Checking 2...")
      for (const member of ctx.message!.new_chat_members) {
        if (member.is_bot) continue;

        const userInfo = await getUserFromDB(member.id);

        console.log("User info: ", userInfo);

        if (!userInfo) {
          if (isSupergroup) {
            ctx.unbanChatMember(member.id);
            continue;
          }
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

        console.log("Wallet info: ", userWalletInfo)

        if (userWalletInfo.profiles.length === 0) {
          console.log("REMOVING: ", member);
          if (isSupergroup) {
            ctx.unbanChatMember(member.id);
            continue;
          }
          ctx.banChatMember(member.id);
          continue;
        }
      }
    }
  }
}
