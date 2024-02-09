"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProfile = void 0;
const anchor_1 = require("@project-serum/anchor");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const web3_js_1 = require("@solana/web3.js");
const liquidhearts_1 = require("liquidhearts");
const decryptData_1 = require("./decryptData");
async function checkProfile(privateKey) {
    const decryptedKey = (0, decryptData_1.decryptData)(privateKey);
    const wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decryptedKey)));
    const connectivity = new liquidhearts_1.Connectivity(wallet, {
        endpoint: "https://gussie-tpnkdl-fast-devnet.helius-rpc.com/",
        programId: "7naVeywiE5AjY5SvwKyfRct9RQVqUTWNG36WhFu7JE6h",
    });
    const commonInfo = await connectivity.getCommonInfo();
    const userInfo = await connectivity.getUserInfo(commonInfo);
    return userInfo.profiles;
}
exports.checkProfile = checkProfile;
