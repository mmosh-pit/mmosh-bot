"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateKeyBase58 = void 0;
const bs58_1 = __importDefault(require("bs58"));
function getPrivateKeyBase58(key) {
    return bs58_1.default.encode(key);
}
exports.getPrivateKeyBase58 = getPrivateKeyBase58;
