import { db } from "../../config/mongoConfig";

export async function getAgent(key: string) {
  return db.collection("mmosh-app-project").findOne({
    key,
  });
}
