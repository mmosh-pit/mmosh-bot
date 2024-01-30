import { ObjectId } from "mongodb";
import { db } from "../../config/mongoConfig";
import { DBUser } from "../../models/DBUser";
import { ReferralData } from "../../models/ReferralData";

export async function updateAndSaveReferData(
  deepLinkUser: ObjectId,
  deepLinkTelegram: number,
  currentUser: ObjectId,
  currentTelegram: number,
): Promise<void> {
  const userCollection = db.collection<DBUser>("users");
  const mmoshCollection = db.collection("mmosh-app-profiles");
  const referrerLinksRelationCollection =
    db.collection<ReferralData>("referral_data");

  const deepLinkMMoshAccount = await mmoshCollection.findOne({
    "telegram.id": deepLinkTelegram,
  });
  const currentMMoshAccount = await mmoshCollection.findOne({
    "telegram.id": currentTelegram,
  });

  if (deepLinkMMoshAccount) {
    await mmoshCollection.updateOne(
      {
        _id: deepLinkMMoshAccount._id,
      },
      {
        $inc: { "telegram.points": 100 },
      },
    );
  }

  if (currentMMoshAccount) {
    await mmoshCollection.updateOne(
      {
        _id: currentMMoshAccount._id,
      },
      {
        $inc: { "telegram.points": 100 },
      },
    );
  }

  await userCollection.updateOne(
    { _id: deepLinkUser },
    {
      $inc: { referredUsers: 1, points: 100 },
    },
  );

  await userCollection.updateOne(
    { _id: currentUser },
    {
      $inc: { points: 100 },
    },
  );

  await referrerLinksRelationCollection.insertOne({
    parent: deepLinkUser,
    child: currentUser,
  });
}
