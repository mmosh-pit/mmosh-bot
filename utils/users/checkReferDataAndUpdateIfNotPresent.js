"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReferDataAndUpdateIfNotPresent = void 0;
const mongoConfig_1 = require("../config/mongoConfig");
const getUserFromDB_1 = require("./getUserFromDB");
async function checkReferDataAndUpdateIfNotPresent(deepLinkId, currentUserId) {
    const userCollection = mongoConfig_1.db.collection("users");
    const referrerLinksRelationCollection = mongoConfig_1.db.collection("referral_data");
    const [deepLinkUser, currentUser] = await Promise.all([
        (0, getUserFromDB_1.getUserFromDB)(deepLinkId),
        (0, getUserFromDB_1.getUserFromDB)(currentUserId),
    ]);
    const referralData = await referrerLinksRelationCollection.findOne({
        referredId: deepLinkUser?._id,
        referringId: currentUser?._id,
    });
    if (!referralData) {
        await referrerLinksRelationCollection.insertOne({
            parent: deepLinkUser?._id,
            child: currentUser?._id,
        });
        await userCollection.updateOne({ _id: deepLinkUser?._id }, {
            $inc: { referredUsers: 1 },
        });
        return true;
    }
    return false;
}
exports.checkReferDataAndUpdateIfNotPresent = checkReferDataAndUpdateIfNotPresent;
