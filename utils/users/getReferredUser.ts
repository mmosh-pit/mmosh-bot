import { ObjectId } from "mongodb";
import { db } from "../../config/mongoConfig";
import { DBUser } from "../../models/DBUser";
import { ReferralData } from "../../models/ReferralData";

export async function getReferredUser(
  currentUserId: ObjectId,
): Promise<DBUser | null> {
  const collection = db.collection<DBUser>("users");
  const referrerLinksRelationCollection =
    db.collection<ReferralData>("referral_data");

  const referralData = await referrerLinksRelationCollection.findOne({
    referringId: currentUserId,
  });

  const referredUser = await collection.findOne({ _id: referralData?.parent });

  if (!referredUser) {
    const fallbackUser = await collection.findOne({ telegramId: 1294956737 });

    return fallbackUser;
  }

  return referredUser;
}
