"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMMOSHData = void 0;
const mongoConfig_1 = require("../../config/mongoConfig");
const updateMMOSHData = async (wallet, data) => {
    const collection = mongoConfig_1.db.collection("mmosh-app-profiles");
    const user = await collection.findOne({
        wallet,
    });
    if (user) {
        await collection.updateOne({
            _id: user._id,
        }, {
            $set: {
                telegram: data,
            },
        });
        return true;
    }
    return false;
};
exports.updateMMOSHData = updateMMOSHData;
