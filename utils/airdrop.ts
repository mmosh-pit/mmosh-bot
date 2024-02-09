import { ObjectId } from "mongodb";
import { db } from "../config/mongoConfig";
import { AirdropWinner } from "../models/AirdropWinner";
import { DBUser } from "../models/DBUser";
import "dotenv/config";

let cachedValue: any = null;

export async function updatePoints(userId: ObjectId, addPoints: number) {
  await db.collection<DBUser>("users").updateOne(
    {
      _id: userId,
    },
    {
      $inc: {
        points: addPoints,
      },
    },
  );
}

export async function updateSubscriberPoints(
  userId: ObjectId,
  addPoints: number,
) {
  await db.collection<DBUser>("users").updateOne(
    {
      _id: userId,
    },
    {
      $inc: {
        points: addPoints,
      },
      $set: {
        airdripSubscribe: true,
      },
    },
  );
}

export async function existsWinner(chatId: number) {
  const result = await db
    .collection<AirdropWinner>("airdrop_winners")
    .findOne({ telegramId: chatId });
  return result;
}

export async function totalAirdropWinners() {
  const result = await db
    .collection<AirdropWinner>("airdrop_winners")
    .countDocuments({}, { hint: "_id_" });
  return result;
}

export async function saveAirdropWinnerData(
  data: AirdropWinner,
): Promise<ObjectId> {
  const result = await db.collection("airdrop_winners").insertOne(data);
  return result.insertedId;
}

// Function to get data using cache
export async function getAirdropInfo() {
  if (cachedValue) {
    console.log("Using cached value:", cachedValue);
    return cachedValue;
  } else {
    console.log("Fetching data from MongoDB for the first time...");
    const data = await db.collection("airdrop_info").findOne();
    cachedValue = data; // Cache the result
    return data;
  }
}
