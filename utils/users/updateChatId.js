"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatId = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function updateChatId(id, userId) {
    await mongoConfig_1.db.collection("users").updateOne({
        _id: userId,
    }, {
        $set: {
            chatId: id,
        },
    });
}
exports.updateChatId = updateChatId;
