"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserData = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function updateUserData(telegramId, firstName, lastName, username) {
    const userCollection = mongoConfig_1.db.collection("users");
    await userCollection.updateOne({
        telegramId,
    }, {
        $set: {
            firstName,
            lastName,
            username,
        },
    });
}
exports.updateUserData = updateUserData;
