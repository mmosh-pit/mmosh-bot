"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCandidates = exports.dumpCandidatesData = exports.AllocateTokens = void 0;
const mongoConfig_1 = require("../config/mongoConfig");
const fs = __importStar(require("fs"));
require("dotenv/config");
const path = require("path");
// Read the configuration file and parse its JSON content
function readConfigFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        //console.error(`Error reading configuration file: ${error.message}`);
        return null;
    }
}
const AllocateTokens = async (numberDecimals, POOL_SIZE) => {
    // Example usage:
    const configFile = "../config/dropKeyConfig.json";
    // Get the absolute path by joining the project root and the relative path
    const absolutePath = path.join(__dirname, configFile);
    const keyConfig = readConfigFile(absolutePath);
    const keyDistribution = [];
    if (keyConfig) {
        const candidatesList = await getAllCandidates();
        let winningIndexes = [];
        let min = 0;
        let max = candidatesList.length;
        //remove portion needed for white key from POOL_SIZE
        // let Remaining_Pool_Size = POOL_SIZE;
        let Remaining_Pool_Size = POOL_SIZE - POOL_SIZE / 100;
        keyConfig.keys.forEach((key) => {
            let random;
            do {
                random = Math.floor(Math.random() * (+max - +min)) + +min;
            } while (winningIndexes.includes(random));
            console.log("User Index selected for : " + key.keyName + " is " + random);
            winningIndexes.push(random);
            let keyWinner = {
                keyname: key.keyName,
                telegramId: candidatesList[random].telegramId,
                publicAddress: candidatesList[random].addressPublicKey,
                tokenNums: parseFloat(((Remaining_Pool_Size / 100) * key.poolPercent).toFixed(numberDecimals)),
            };
            keyDistribution.push(keyWinner);
        });
        let perWhiteKeyTokens = 0;
        //if winners less than number of keys in list
        if (candidatesList.length > winningIndexes.length) {
            perWhiteKeyTokens = parseFloat((POOL_SIZE /
                (100 * (candidatesList.length - winningIndexes.length))).toFixed(numberDecimals));
        }
        else {
            console.log("White Key is not distributed as every candidate already got some key.");
        }
        candidatesList.forEach((candidate, index) => {
            if (!winningIndexes.includes(index)) {
                let keyWinner = {
                    keyname: "White Key",
                    telegramId: candidate.telegramId,
                    publicAddress: candidate.addressPublicKey,
                    tokenNums: perWhiteKeyTokens,
                };
                keyDistribution.push(keyWinner);
            }
        });
        fs.writeFile("keyDistribution.json", JSON.stringify(keyDistribution), "utf8", function (err) {
            if (err)
                throw err;
        });
    }
    return keyDistribution;
};
exports.AllocateTokens = AllocateTokens;
async function dumpCandidatesData(data) {
    const result = await mongoConfig_1.db.collection("airdrop_winners").insertMany(data);
    return result;
}
exports.dumpCandidatesData = dumpCandidatesData;
async function getAllCandidates() {
    const result = mongoConfig_1.db.collection("airdrop_winners").find({});
    return result.toArray();
}
exports.getAllCandidates = getAllCandidates;
