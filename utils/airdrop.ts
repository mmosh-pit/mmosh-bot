import { ObjectId } from "mongodb";
import { db } from "../config/mongoConfig";
import { AirdropWinner } from "../models/AirdropWinner";
import { DBUser } from "../models/DBUser";
import "dotenv/config";

export async function updatePoints(userId: ObjectId, addPoints: number) {
  const result = await db.collection<DBUser>("users").updateOne(
    {
      _id: userId,
    },
    {
      $inc: {
        points: addPoints,
      },
    }
  );
  //   console.log(result);
}

export async function updateSubscriberPoints(
  userId: ObjectId,
  addPoints: number
) {
  const result = await db.collection<DBUser>("users").updateOne(
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
    }
  );
  //   console.log(result);
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
  data: AirdropWinner
): Promise<ObjectId> {
  const result = await db.collection("airdrop_winners").insertOne(data);
  return result.insertedId;
}
