"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirdropInfo = exports.saveAirdropWinnerData = exports.totalAirdropWinners = exports.existsWinner = exports.updateSubscriberPoints = exports.updatePoints = void 0;
const mongoConfig_1 = require("../config/mongoConfig");
require("dotenv/config");
let cachedValue = null;
async function updatePoints(userId, addPoints) {
    await mongoConfig_1.db.collection("users").updateOne({
        _id: userId,
    }, {
        $inc: {
            points: addPoints,
        },
    });
}
exports.updatePoints = updatePoints;
async function updateSubscriberPoints(userId, addPoints) {
    await mongoConfig_1.db.collection("users").updateOne({
        _id: userId,
    }, {
        $inc: {
            points: addPoints,
        },
        $set: {
            airdripSubscribe: true,
        },
    });
}
exports.updateSubscriberPoints = updateSubscriberPoints;
async function existsWinner(chatId) {
    const result = await mongoConfig_1.db
        .collection("airdrop_winners")
        .findOne({ telegramId: chatId });
    return result;
}
exports.existsWinner = existsWinner;
async function totalAirdropWinners() {
    const result = await mongoConfig_1.db
        .collection("airdrop_winners")
        .countDocuments({}, { hint: "_id_" });
    return result;
}
exports.totalAirdropWinners = totalAirdropWinners;
async function saveAirdropWinnerData(data) {
    const result = await mongoConfig_1.db.collection("airdrop_winners").insertOne(data);
    return result.insertedId;
}
exports.saveAirdropWinnerData = saveAirdropWinnerData;
// Function to get data using cache
async function getAirdropInfo() {
    if (cachedValue) {
        console.log("Using cached value:", cachedValue);
        return cachedValue;
    }
    else {
        console.log("Fetching data from MongoDB for the first time...");
        const data = await mongoConfig_1.db.collection("airdrop_info").findOne();
        cachedValue = data; // Cache the result
        return data;
    }
}
exports.getAirdropInfo = getAirdropInfo;
