import { db } from "../../config/mongoConfig";
import { DBUser } from "../../models/DBUser";

export async function getUserPoints(
  id: number,
): Promise<Pick<DBUser, "points"> | null> {
  const collection = db.collection<DBUser>("users");
  const data = await collection.findOne(
    { telegramId: id },
    {
      projection: {
        points: 1,
      },
    },
  );

  return data;
}
