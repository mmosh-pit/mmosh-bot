import { db } from "../../config/mongoConfig";
import { MMOSHData } from "../../models/MMOSHData";

export async function getLinkedUser(id: number): Promise<MMOSHData | null> {
  const collection = db.collection<MMOSHData>("mmosh-app-profiles");
  const data = await collection.findOne({ "telegram.id": id });

  return data;
}
