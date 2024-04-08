import { db } from "../../config/mongoConfig";

export async function updateGroupTokenGatingInfo(
  groupId: string,
  adminId: number,
  tokenAddress: string,
  tokenType: string,
  amount: number,
): Promise<string> {
  const collection = db.collection("token-gating-rules");

  const info = await collection.findOne({ groupId });

  if (!info) return "not-found";
  if (info.adminId !== adminId) return "invalid-admin";

  await collection.updateOne(
    { _id: info._id },
    {
      $set: {
        tokenAddress,
        tokenType,
        amount,
      },
    },
  );

  return "";
}
