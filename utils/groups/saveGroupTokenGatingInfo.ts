import { db } from "../../config/mongoConfig";

export async function saveGroupTokenGatingInfo(
  groupId: string,
  groupUsername: string,
  adminId: number,
) {
  const collection = db.collection("token-gating-rules");

  const savedData = await collection.findOne({ groupId });

  if (!savedData) {
    await collection.insertOne({
      groupId,
      groupUsername,
      adminId,
    });
  }
}
