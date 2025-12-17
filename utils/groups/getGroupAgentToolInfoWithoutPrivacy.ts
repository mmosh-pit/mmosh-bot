import { db } from "../../config/mongoConfig";

export async function getGroupAgentToolInfoWithoutPrivacy(username: string) {
  const collection = db.collection("mmosh-app-project-tools");

  console.log("Username: ", username);

  const data = await collection.findOne({
    type: "telegram",
    "data.handle": username,
  });
  console.log("Value: ", data);

  return data;
}

export async function getGroupAgentToolInfoWithoutPrivacyBotToken(username: string) {
  const collection = db.collection("mmosh-app-project-tools");

  console.log("Username: ", username);

  const data = await collection.findOne({
    type: "telegram",
    "data.botToken": username,
  });
  console.log("Value: ", data);

  return data;
}
