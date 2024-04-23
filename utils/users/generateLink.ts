import { db } from "../../config/mongoConfig";

const MMOSH_APP_URL = process.env.MMOSH_APP_URL!;

export async function generateLink(addressPublicKey: string) {
  const collection = db.collection("temporal-links");

  const existingData = await collection.findOne({ addressPublicKey });

  if (existingData) {
    return `${MMOSH_APP_URL}?socialwallet=${existingData.token}`;
  }

  const token = randomGenerator() + randomGenerator();
  await collection.insertOne({
    addressPublicKey,
    token,
  });

  return `${MMOSH_APP_URL}?socialwallet=${token}`;
}

const randomGenerator = () => {
  return Math.random().toString(36).substring(2);
};
