import { db } from "../../config/mongoConfig";

export async function getGroupAgentToolInfo(username: string) {
  const collection = db.collection("mmosh-app-project-tools");

  const data = await collection.findOne({
    type: "telegram",
    "data.handle": username,
    "data.privacy": "gated",
  });

  return data;
}
