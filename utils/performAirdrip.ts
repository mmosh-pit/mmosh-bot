import {
  clusterApiUrl,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import { Drop, AllocateTokens } from "./airdrip";
import { sendNotifications } from "./notifications";
import "dotenv/config";
import * as fs from "fs";
import bs58 from "bs58";

const secret = process.env.AIRDRIP_SECRET_KEY!;

//const endpoint = clusterApiUrl("devnet");
const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER ||
  clusterApiUrl((process.env.NETWORK as any) || "devnet");
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const connection = new Connection(endpoint);

// const MINT_ADDRESS = "6XutmY2No17wK8AMxjwfGeqKPL1RyFR6d9u49VPJ5Nn4";

const FROM_KEY_PAIR = Keypair.fromSecretKey(bs58.decode(secret));
const NUM_DROPS_PER_TX = 10;
const TX_INTERVAL = 1000;

async function getNumberDecimals(mintAddress: string): Promise<number> {
  const info = await connection.getParsedAccountInfo(
    new PublicKey(mintAddress),
  );
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
}

let numberDecimals = 0;

async function generateTransactions(
  batchSize: number,
  dropList: Drop[],
  fromWallet: PublicKey,
  MINT_ADDRESS: string,
): Promise<Transaction[]> {
  console.log(`1 - Getting Source Token Account for`);
  let sourceAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    FROM_KEY_PAIR,
    new PublicKey(MINT_ADDRESS),
    FROM_KEY_PAIR.publicKey,
    false,
    "confirmed",
    {
      commitment: "confirmed",
    },
  );
  console.log(`Source Account: ${sourceAccount.address.toString()}`);

  let result: Transaction[] = [];

  const numTransactions = Math.ceil(dropList.length / batchSize);
  console.log("NUM TRANSACTIONS: ", numTransactions);
  for (let i = 0; i < numTransactions; i++) {
    let bulkTransaction = new Transaction();
    let lowerIndex = i * batchSize;
    let upperIndex = (i + 1) * batchSize;
    for (let j = lowerIndex; j < upperIndex; j++) {
      if (dropList[j]) {
        console.log(
          `2 - Getting Destination Token Account for address ${dropList[j].publicAddress}`,
        );
        try {
          new PublicKey(dropList[j].publicAddress);
        } catch (error: any) {
          console.log("c...", error.message);
          fs.appendFile(
            "skipped-accounts.csv",
            Object.values(dropList[j]).join(",") + "\n",
            (err) => {
              if (err) {
                console.error("Error appending to file:", err);
              } else {
                console.log("Skipped data appended to file successfully.");
              }
            },
          );
          continue;
        }
        let destinationAccount;
        try {
          destinationAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            FROM_KEY_PAIR,
            new PublicKey(MINT_ADDRESS),
            new PublicKey(dropList[j].publicAddress),
            false,
            "confirmed",
            {
              commitment: "confirmed",
            },
          );
          console.log(
            `    Destination Account: ${destinationAccount.address.toString()}`,
          );
        } catch (error) {
          fs.appendFile(
            "failed-airdrops.csv",
            Object.values(dropList[j]).join(",") + "\n",
            (err) => {
              if (err) {
                console.error("Error appending to file:", err);
              } else {
                console.log("Failed data appended to file successfully.");
              }
            },
          );
          continue;
        }

        fs.appendFile(
          "processed-airdrops.csv",
          Object.values(dropList[j]).join(",") + "\n",
          (err) => {
            if (err) {
              console.error("Error appending to file:", err);
            } else {
              console.log("Processed data appended to file successfully.");
            }
          },
        );

        bulkTransaction.add(
          createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            FROM_KEY_PAIR.publicKey,
            dropList[j].tokenNums * Math.pow(10, numberDecimals),
            // drop.numTokens
          ),
        );
      }
    }
    result.push(bulkTransaction);
  }
  return result;
}

async function executeTransactions(
  solanaConnection: Connection,
  transactionList: Transaction[],
  payer: Keypair,
): Promise<PromiseSettledResult<string>[]> {
  let result: PromiseSettledResult<string>[] = [];
  let staggeredTransactions: Promise<string>[] = transactionList.map(
    (transaction, i, allTx) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
          solanaConnection
            .getLatestBlockhash()
            .then(
              (recentHash) =>
                (transaction.recentBlockhash = recentHash.blockhash),
            )
            .then(() =>
              sendAndConfirmTransaction(solanaConnection, transaction, [payer]),
            )
            .then(resolve);
        }, i * TX_INTERVAL);
      });
    },
  );
  result = await Promise.allSettled(staggeredTransactions);
  fs.appendFile("airdrop-transactions.json", JSON.stringify(result), (err) => {
    if (err) {
      console.error("Error appending to file:", err);
    } else {
      console.log("Transaction data appended to file successfully.");
    }
  });
  return result;
}

//(
export async function performAirdrip(airdripInfo: any) {
  // Step 3
  console.log("Starting airdrip...");
  console.log(" 1.");
  const MINT_ADDRESS = airdripInfo.mintAddress;
  const poolSize = airdripInfo.poolSize;
  console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
  numberDecimals = await getNumberDecimals(MINT_ADDRESS);
  console.log(`    Number of Decimals: ${numberDecimals}`);

  const dropList = await AllocateTokens(numberDecimals, poolSize);
  console.log(`Initiating SOL drop from ${FROM_KEY_PAIR.publicKey.toString()}`);
  const transactionList = await generateTransactions(
    NUM_DROPS_PER_TX,
    dropList,
    FROM_KEY_PAIR.publicKey,
    MINT_ADDRESS,
  );
  const txResults = await executeTransactions(
    connection,
    transactionList,
    FROM_KEY_PAIR,
  );
  console.log(txResults);
  await sendNotifications(dropList, airdripInfo.tokenSymbol);
}
