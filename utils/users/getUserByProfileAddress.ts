import { db } from "../../config/mongoConfig";
import { MMOSHData } from "../../models/MMOSHData";

export async function getUserByProfileAddress(
  address: string,
): Promise<MMOSHData | null> {
  const collection = db.collection<MMOSHData>("mmosh-app-profiles");

  const data = await collection.findOne({ profilenft: address });

  return data;
}
