import { Wallet } from "@coral-xyz/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";
import { Connectivity } from "liquidhearts";
import { decryptData } from "./decryptData";

export async function checkProfile(privateKey: string) {
  const decryptedKey = decryptData(privateKey);
  const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(decryptedKey)));

  const connectivity = new Connectivity(wallet, {
    endpoint: "https://gussie-tpnkdl-fast-devnet.helius-rpc.com/",
    programId: "7naVeywiE5AjY5SvwKyfRct9RQVqUTWNG36WhFu7JE6h",
  });

  const commonInfo = await connectivity.getCommonInfo();

  const userInfo = await connectivity.getUserInfo(commonInfo);

  return userInfo.profiles;
}
