"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPoints = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function getUserPoints(id) {
    const collection = mongoConfig_1.db.collection("users");
    const data = await collection.findOne({ telegramId: id }, {
        projection: {
            points: 1,
        },
    });
    return data;
}
exports.getUserPoints = getUserPoints;
