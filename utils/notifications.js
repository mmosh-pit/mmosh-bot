"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
const axios_1 = __importDefault(require("axios"));
const readFile_1 = require("./readFile");
require("dotenv/config");
const POOL = parseInt(process.env.POOL_SIZE || "10");
const BOT_TOKEN = process.env.BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const getUsernameUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
const keyConfigFile = "../config/dropKeyConfig.json";
const keyConfig = (0, readFile_1.readConfigFile)(keyConfigFile);
async function createMessage(keyDistribution) {
    try {
        let MESSAGE = "Congratulations to the following winners!\n\n";
        let i = 0;
        for (i = 0; i < keyConfig.keys.length; i++) {
            let username = keyDistribution[i].telegramId;
            try {
                const userDetail = await axios_1.default.post(getUsernameUrl, {
                    chat_id: keyDistribution[i].telegramId,
                    user_id: keyDistribution[i].telegramId,
                });
                username = userDetail.data.result.user.username || "unknown";
            }
            catch (error) {
                console.log(error);
            }
            let text = `${keyDistribution[i].keyname} : ${username} ${keyDistribution[i].tokenNums} $LOVE.\n`;
            MESSAGE = MESSAGE + text;
        }
        const whiteKeyTokens = POOL / (100 * keyDistribution.length);
        MESSAGE =
            MESSAGE +
                `\nAnd everyone else receive a White Key, worth more than ${whiteKeyTokens} $LOVE`;
        return MESSAGE;
    }
    catch (e) {
        console.log("error:" + e);
    }
}
async function sendMessage(CHAT_ID, MESSAGE) {
    try {
        await axios_1.default.post(apiUrl, {
            chat_id: CHAT_ID,
            text: MESSAGE,
        });
    }
    catch (error) {
        console.error(error);
        null;
    }
}
async function sendNotifications(keyDistribution) {
    const message = await createMessage(keyDistribution);
    console.log(message);
    keyDistribution.forEach((winner) => {
        sendMessage(winner.telegramId, message || "");
    });
}
exports.sendNotifications = sendNotifications;
