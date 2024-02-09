"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndSaveReferData = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
async function updateAndSaveReferData(deepLinkUser, deepLinkTelegram, currentUser, currentTelegram) {
    const userCollection = mongoConfig_1.db.collection("users");
    const mmoshCollection = mongoConfig_1.db.collection("mmosh-app-profiles");
    const referrerLinksRelationCollection = mongoConfig_1.db.collection("referral_data");
    const deepLinkMMoshAccount = await mmoshCollection.findOne({
        "telegram.id": deepLinkTelegram,
    });
    const currentMMoshAccount = await mmoshCollection.findOne({
        "telegram.id": currentTelegram,
    });
    if (deepLinkMMoshAccount) {
        await mmoshCollection.updateOne({
            _id: deepLinkMMoshAccount._id,
        }, {
            $inc: { "telegram.points": 100 },
        });
    }
    if (currentMMoshAccount) {
        await mmoshCollection.updateOne({
            _id: currentMMoshAccount._id,
        }, {
            $inc: { "telegram.points": 100 },
        });
    }
    await userCollection.updateOne({ _id: deepLinkUser }, {
        $inc: { referredUsers: 1, points: 100 },
    });
    await userCollection.updateOne({ _id: currentUser }, {
        $inc: { points: 100 },
    });
    await referrerLinksRelationCollection.insertOne({
        parent: deepLinkUser,
        child: currentUser,
    });
}
exports.updateAndSaveReferData = updateAndSaveReferData;
