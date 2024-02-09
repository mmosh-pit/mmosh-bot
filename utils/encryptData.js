"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = void 0;
const crypto_1 = __importDefault(require("crypto"));
function encryptData(data) {
    const encryptionMethod = process.env.ENCRYPTION_METHOD;
    const secretKey = process.env.SECRET_KEY;
    const secretIv = process.env.SECRET_IV;
    console.log(encryptionMethod, secretKey, secretIv);
    const key = crypto_1.default
        .createHash("sha512")
        .update(secretKey)
        .digest("hex")
        .substring(0, 32);
    const encryptionIV = crypto_1.default
        .createHash("sha512")
        .update(secretIv)
        .digest("hex")
        .substring(0, 16);
    const cipher = crypto_1.default.createCipheriv(encryptionMethod, key, encryptionIV);
    return Buffer.from(cipher.update(data, "utf8", "hex") + cipher.final("hex")).toString("base64"); // Encrypts data and converts to hex and base64
}
exports.encryptData = encryptData;
