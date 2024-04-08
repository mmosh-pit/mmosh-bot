import { Context } from "grammy";
import { getGroupTokenGatingInfo } from "../utils/groups/getGroupTokenGatingConfig";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { getUserLinkedWallet } from "../utils/users/getUserLinkedWallet";
import { getAssetsByWallet } from "../utils/web3/getAssetsByWallet";

export async function checkForUserProfileNFT(ctx: Context) {
  if (ctx.from?.is_bot) return;

  const isGroup = ctx.message?.chat.type === "group";
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isGroup || isSupergroup) {
    if (ctx.message!.new_chat_members) {
      const tokenGatingConfig = await getGroupTokenGatingInfo(
        ctx.message.chat.id,
      );

      if (!tokenGatingConfig) return;
      if (!tokenGatingConfig.tokenAddress) return;

      const fetchFungibles =
        tokenGatingConfig.tokenType === "sft" ||
        tokenGatingConfig.tokenType === "coin";

      for (const member of ctx.message!.new_chat_members) {
        if (member.is_bot) continue;

        const userInfo = await getUserFromDB(member.id);

        if (!userInfo) {
          banChatMember(ctx, member.id);
          continue;
        }

        const containsRightAsset = await checkIfUserCanJoinGroup(
          userInfo.addressPublicKey,
          fetchFungibles,
          tokenGatingConfig.tokenAddress,
          tokenGatingConfig.amount,
          tokenGatingConfig.tokenType,
        );

        if (!containsRightAsset) {
          const linkedWallet = await getUserLinkedWallet(member.id);

          if (linkedWallet) {
            const containsAsset = await checkIfUserCanJoinGroup(
              linkedWallet.wallet,
              fetchFungibles,
              tokenGatingConfig.tokenAddress,
              tokenGatingConfig.amount,
              tokenGatingConfig.tokenType,
            );

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
  collectionAddress: string,
  amount: number,
  type: string,
): Promise<boolean> {
  const userWalletInfo = await getAssetsByWallet(wallet, fetchFungibles);

  let amountOfAssets = 0;

  console.log("----------------------------");
  console.log("Assets for wallet: ", wallet);

  userWalletInfo.result.items.forEach((val: any) => {
    const collectionData = val.grouping.find(
      (group: any) => group.group_key === "collection",
    );

    if (type === "coin") {
      if (val.id === collectionAddress) {
        amountOfAssets += val.token_info.balance;
      }
    } else {
      if (collectionData?.group_value === collectionAddress) {
        amountOfAssets += val.token_info.balance;
      }
    }
  });

  console.log("----------------------------");

  console.log(
    "Has asset: {amount of assets} - required amount ",
    amountOfAssets,
    amount,
  );

  return amountOfAssets >= amount;
}

async function banChatMember(ctx: Context, memberId: number) {
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isSupergroup) {
    await ctx.unbanChatMember(memberId);
  }
  await ctx.banChatMember(memberId);
}
