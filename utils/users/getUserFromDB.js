"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromDB = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function getUserFromDB(id) {
    const collection = mongoConfig_1.db.collection("users");
    const data = await collection.findOne({ telegramId: id });
    return data;
}
exports.getUserFromDB = getUserFromDB;
