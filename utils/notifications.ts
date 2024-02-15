import axios from "axios";

import { readConfigFile } from "./readFile";
import "dotenv/config";

const POOL = parseInt(process.env.POOL_SIZE || "10");

const BOT_TOKEN = process.env.BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const getUsernameUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;

const keyConfigFile = "../config/dropKeyConfig.json";
const keyConfig = readConfigFile(keyConfigFile);

async function createMessage(keyDistribution: any, tokenSymbol?: string) {
  try {
    let MESSAGE = "Congratulations to the following winners!\n\n";
    let i = 0;
    for (i = 0; i < keyConfig.keys.length; i++) {
      let username = keyDistribution[i].telegramId;
      try {
        const userDetail = await axios.post(getUsernameUrl, {
          chat_id: keyDistribution[i].telegramId,
          user_id: keyDistribution[i].telegramId,
        });
        username = userDetail.data.result.user.username || "unknown";
      } catch (error) {
        console.log(error);
      }
      let text = `${keyDistribution[i].keyname} : ${username} ${keyDistribution[i].tokenNums} ${tokenSymbol}.\n`;
      MESSAGE = MESSAGE + text;
    }
    const whiteKeyTokens = POOL / (100 * keyDistribution.length);
    MESSAGE =
      MESSAGE +
      `\nAnd everyone else receive a White Key, worth more than ${whiteKeyTokens} ${tokenSymbol}`;
    return MESSAGE;
  } catch (e) {
    console.log("error:" + e);
  }
}

async function sendMessage(CHAT_ID: any, MESSAGE: string) {
  try {
    await axios.post(apiUrl, {
      chat_id: CHAT_ID,
      text: MESSAGE,
    });
  } catch (error) {
    console.error(error);
    null;
  }
}

export async function sendNotifications(
  keyDistribution: any,
  tokenSymbol?: string,
) {
  const message = await createMessage(keyDistribution, tokenSymbol);
  console.log(message);
  keyDistribution.forEach((winner: any) => {
    sendMessage(winner.telegramId, message || "");
  });
}
