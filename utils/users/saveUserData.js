"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserData = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function saveUserData(data) {
    const result = await mongoConfig_1.db.collection("users").insertOne(data);
    return result.insertedId;
}
exports.saveUserData = saveUserData;
