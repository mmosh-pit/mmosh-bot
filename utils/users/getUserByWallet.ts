import { db } from "../../config/mongoConfig";
import { DBUser } from "../../models/DBUser";

export async function getUserByWallet(wallet: string): Promise<DBUser | null> {
  const collection = db.collection<DBUser>("users");
  const data = await collection.findOne({ addressPublicKey: wallet });

  return data;
}
