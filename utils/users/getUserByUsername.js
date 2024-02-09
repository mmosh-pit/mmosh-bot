"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByUsername = void 0;
const mongoConfig_1 = require("../config/mongoConfig");
async function getUserByUsername(username) {
    if (!username)
        return null;
    const collection = mongoConfig_1.db.collection("users");
    const data = await collection.findOne({ username: username });
    return data;
}
exports.getUserByUsername = getUserByUsername;
