import { db } from "../config/mongoConfig";
import { AirdropWinner } from "../models/AirdropWinner";
import * as fs from "fs";
import "dotenv/config";
const path = require("path");

export interface Canditates {
  addressPublicKey: string;
  telegramId: number;
}
interface Key {
  keyName: string;
  poolPercent: number;
}
//Define a TypeScript interface to represent the structure of the configuration file
interface AppConfig {
  keys: [Key];
}

export interface Drop {
  keyname: string;
  telegramId: number;
  publicAddress: string;
  tokenNums: number;
}

// Read the configuration file and parse its JSON content
function readConfigFile(filePath: string): AppConfig | null {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    //console.error(`Error reading configuration file: ${error.message}`);
    return null;
  }
}

export const AllocateTokens = async (
  numberDecimals: number,
  POOL_SIZE: number,
): Promise<Drop[]> => {
  // Example usage:
  const configFile = "../config/dropKeyConfig.json";
  // Get the absolute path by joining the project root and the relative path
  const absolutePath = path.join(__dirname, configFile);
  const keyConfig = readConfigFile(absolutePath);
  const keyDistribution = <Drop[]>[];

  if (keyConfig) {
    const candidatesList: Canditates[] = await getAllCandidates();
    let winningIndexes: number[] = [];
    let min = 0;
    let max = candidatesList.length;

    //remove portion needed for white key from POOL_SIZE
    // let Remaining_Pool_Size = POOL_SIZE;
    let Remaining_Pool_Size = POOL_SIZE - POOL_SIZE / 100;

    keyConfig.keys.forEach((key) => {
      let random;
      do {
        random = Math.floor(Math.random() * (+max - +min)) + +min;
      } while (winningIndexes.includes(random));
      console.log("User Index selected for : " + key.keyName + " is " + random);
      winningIndexes.push(random);
      let keyWinner = {
        keyname: key.keyName,
        telegramId: candidatesList[random].telegramId,
        publicAddress: candidatesList[random].addressPublicKey,
        tokenNums: parseFloat(
          ((Remaining_Pool_Size / 100) * key.poolPercent).toFixed(
            numberDecimals,
          ),
        ),
      };
      keyDistribution.push(keyWinner);
    });

    let perWhiteKeyTokens = 0;
    //if winners less than number of keys in list
    if (candidatesList.length > winningIndexes.length) {
      perWhiteKeyTokens = parseFloat(
        (
          POOL_SIZE /
          (100 * (candidatesList.length - winningIndexes.length))
        ).toFixed(numberDecimals),
      );
    } else {
      console.log(
        "White Key is not distributed as every candidate already got some key.",
      );
    }

    candidatesList.forEach((candidate, index) => {
      if (!winningIndexes.includes(index)) {
        let keyWinner = {
          keyname: "White Key",
          telegramId: candidate.telegramId,
          publicAddress: candidate.addressPublicKey,
          tokenNums: perWhiteKeyTokens,
        };
        keyDistribution.push(keyWinner);
      }
    });

    fs.writeFile(
      "keyDistribution.json",
      JSON.stringify(keyDistribution),
      "utf8",
      function (err) {
        if (err) throw err;
      },
    );
  }
  return keyDistribution;
};

export async function dumpCandidatesData(data: AirdropWinner[]): Promise<any> {
  const result = await db.collection("airdrop_winners").insertMany(data);
  return result;
}

export async function getAllCandidates(): Promise<any> {
  const result = db.collection("airdrop_winners").find({});
  return result.toArray();
}
