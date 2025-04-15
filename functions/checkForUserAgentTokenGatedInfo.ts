import { Context } from "grammy";
import { getGroupAgentToolInfo } from "../utils/groups/getGroupAgentToolInfo";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { getUserLinkedWallet } from "../utils/users/getUserLinkedWallet";
import { getAssetsByWallet } from "../utils/web3/getAssetsByWallet";

export async function checkForUserAgentTokenGatedInfo(ctx: Context) {
  if (ctx.from?.is_bot) return;

  const isGroup = ctx.message?.chat.type === "group";
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isGroup || isSupergroup) {
    if (ctx.message!.new_chat_members) {
      const tokenGatingConfig = await getGroupAgentToolInfo(
        ctx.message.chat.username!,
      );

      if (!tokenGatingConfig) return;

      console.log("Got config!");

      for (const member of ctx.message!.new_chat_members) {
        if (member.is_bot) continue;

        const userInfo = await getUserFromDB(member.id);

        if (!userInfo) {
          banChatMember(ctx, member.id);
          continue;
        }

        const containsRightAsset = await checkIfUserCanJoinGroup(
          userInfo.addressPublicKey!,
          false,
          tokenGatingConfig.project,
        );

        console.log(
          "Does this User contains the right asset? ",
          containsRightAsset,
        );

        if (!containsRightAsset) {
          const linkedWallet = await getUserLinkedWallet(member.id);

          console.log("Do we have a linked wallet? ", !!linkedWallet);

          if (linkedWallet) {
            const containsAsset = await checkIfUserCanJoinGroup(
              linkedWallet.wallet,
              false,
              tokenGatingConfig.project,
            );

            console.log("Contains right asset? ", containsRightAsset);

            if (containsAsset) {
              continue;
            }
          }

          banChatMember(ctx, member.id);
          continue;
        }
      }
    }
  }
}

async function checkIfUserCanJoinGroup(
  wallet: string,
  fetchFungibles: boolean,
  projectKey: string,
): Promise<boolean> {
  const userWalletInfo = await getAssetsByWallet(wallet, fetchFungibles);

  let result = false;

  userWalletInfo.result.items.forEach((val: any) => {
    const value = val.content.metadata.attributes?.find(
      (attr: any) => attr.trait_type === "Project",
    )?.value;

    if (value === projectKey) {
      result = true;
    }
  });

  return result;
}

async function banChatMember(ctx: Context, memberId: number) {
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isSupergroup) {
    await ctx.unbanChatMember(memberId);
  }
  await ctx.banChatMember(memberId);
}
