import { db } from "../config/mongoConfig";
import { encryptData } from "./encryptData";
import { createSolanaAddress } from "./web3/createSolanaAddress";
import { getPrivateKeyBase58 } from "./web3/getPrivateKeyBase58";

export async function generateWallet(existingWallet: string) {
  if (existingWallet) {
    const collection = db.collection("mmosh-users");

    const user = await collection.findOne({
      address: existingWallet,
    });

    if (user) {
      return {
        address: existingWallet,
        pKey: user!.privateKey,
      };
    }
  }

  const newAddress = createSolanaAddress();

  const pKey = getPrivateKeyBase58(newAddress.secretKey);
  const encryptedKey = encryptData(pKey);

  return {
    address: newAddress.publicKey.toBase58(),
    pKey: encryptedKey,
  };
}
