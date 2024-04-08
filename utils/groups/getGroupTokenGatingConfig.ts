import { db } from "../../config/mongoConfig";

export async function getGroupTokenGatingInfo(groupId: number) {
  const collection = db.collection("token-gating-rules");

  const res = await collection.findOne({
    groupId,
  });

  return res;
}
