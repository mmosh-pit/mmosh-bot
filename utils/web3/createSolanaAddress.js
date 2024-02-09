"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSolanaAddress = void 0;
const web3_js_1 = require("@solana/web3.js");
function createSolanaAddress() {
    const address = web3_js_1.Keypair.generate();
    return address;
}
exports.createSolanaAddress = createSolanaAddress;
