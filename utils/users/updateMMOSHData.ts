import { db } from "../../config/mongoConfig";
import { MMOSHTelegram } from "../../models/MMOSHTelegram";

export const updateMMOSHData = async (
  wallet: string,
  data: MMOSHTelegram,
): Promise<boolean> => {
  const collection = db.collection("mmosh-app-profiles");

  const user = await collection.findOne({
    wallet,
  });

  if (user) {
    await collection.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          telegram: data,
        },
      },
    );
    return true;
  }

  return false;
};
