import { db } from "../../config/mongoConfig";

export async function addTelegramToUser(
  telegramId: number,
  walletAddress: string,
) {
  const collection = db.collection("mmosh-users");

  const user = await collection.findOne({
    address: walletAddress,
  });

  if (!user) return;

  await collection.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        telegramId,
      },
    },
  );
}
