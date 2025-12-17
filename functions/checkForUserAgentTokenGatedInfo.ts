import { Context } from "grammy";
import { getGroupAgentToolInfo } from "../utils/groups/getGroupAgentToolInfo";
import { getUserFromDB, getUserFromMmoshUser } from "../utils/users/getUserFromDB";
import { getUserLinkedWallet } from "../utils/users/getUserLinkedWallet";
import { getAssetsByWallet } from "../utils/web3/getAssetsByWallet";
import { getProjectToolsInfo } from "../utils/groups/getProjectToolsInfo";

export async function checkForUserAgentTokenGatedInfo(ctx: Context) {
  if (ctx.from?.is_bot) return;

  console.log("after message");

  const isGroup = ctx.message?.chat.type === "group";
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isGroup || isSupergroup) {
    console.log("IsGrouppp>>>", ctx.message!.new_chat_members, ctx.message.chat.username)
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


export async function checkForUserAgentTokenGatedInfoV1(ctx: Context, projectId: string) {
  console.log("Checking for user agent token gated info...", JSON.stringify(ctx, null, 2));
  if (ctx.from?.is_bot) return;

  console.log("after message");

  const isGroup = ctx.message?.chat.type === "group";
  const isSupergroup = ctx.message?.chat.type === "supergroup";

  if (isGroup || isSupergroup) {
    console.log("IsGrouppp>>>", ctx.message!.new_chat_members, ctx.message.chat.username)
    if (ctx.message!.new_chat_members) {
      const tokenGatingConfig = await getProjectToolsInfo(
        ctx.api.token, projectId,
      );

      if (!tokenGatingConfig) return;

      console.log("Got config!");

      for (const member of ctx.message!.new_chat_members) {
        if (member.is_bot) continue;

        const userInfo = await getUserFromMmoshUser(member.id);

        /* if (!userInfo) {
          banChatMember(ctx, member.id);
          continue;
        } */

        /* const containsRightAsset = await checkIfUserCanJoinGroup(
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
        } */
        const checkRights = checkUserGroupPermission(userInfo,tokenGatingConfig, ctx.chat?.id);
        console.log(checkRights, "==checkRights")
        if (!checkRights) {
          banChatMember(ctx, member.id);
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

function checkUserGroupPermission(user: any, project: any, groupId: number | undefined) {
  console.log(JSON.stringify(user, null, 2), JSON.stringify(project, null, 2), groupId, "==inpuut params")
  let groupObj = project.groups.find((f: any) => f.groupId == groupId);
  if (!groupObj) {
    return true;
  }
  if (groupObj.status == 'members' && ['member', 'wizard'].includes(user?.role)) {
    return true
  } else if (groupObj.status == 'gated' && user) {
    return true
  } else if (groupObj.status == 'open') {
    return true
  } else {
    return false
  }
}

async function banChatMember(ctx: Context, memberId: number) {
  try {
    console.log("banchatmember", memberId)
    const isSupergroup = ctx.message?.chat.type === "supergroup";

    if (isSupergroup) {
      await ctx.unbanChatMember(memberId);
    }
    await ctx.banChatMember(memberId);  
  } catch (error) {
    
  }
  
}
