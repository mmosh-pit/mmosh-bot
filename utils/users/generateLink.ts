import { db } from "../../config/mongoConfig";

const MMOSH_APP_URL = process.env.MMOSH_APP_URL!;

export async function generateLink(addressPublicKey: string) {
  const token = randomGenerator() + randomGenerator();

  const collection = db.collection("temporal-links");

  await collection.insertOne({
    addressPublicKey,
    token,
  });

  return `${MMOSH_APP_URL}?socialaddress=${token}`;
}

const randomGenerator = () => {
  return Math.random().toString(36).substring(2);
};
