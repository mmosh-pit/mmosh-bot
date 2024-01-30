import { db } from "../../config/mongoConfig";
import { DBUser } from "../../models/DBUser";

export async function updateUserData(
  telegramId: number,
  firstName: string,
  lastName: string,
  username: string,
) {
  const userCollection = db.collection<DBUser>("users");

  await userCollection.updateOne(
    {
      telegramId,
    },
    {
      $set: {
        firstName,
        lastName,
        username,
      },
    },
  );
}
