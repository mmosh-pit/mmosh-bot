"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = void 0;
const crypto_1 = __importDefault(require("crypto"));
function decryptData(encryptedData) {
    const encryptionMethod = process.env.ENCRYPTION_METHOD;
    const secretKey = process.env.SECRET_KEY;
    const secretIv = process.env.SECRET_IV;
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
    const buff = Buffer.from(encryptedData, "base64");
    const decipher = crypto_1.default.createDecipheriv(encryptionMethod, key, encryptionIV);
    return (decipher.update(buff.toString("utf8"), "hex", "utf8") +
        decipher.final("utf8")); // Decrypts data and converts to utf8
}
exports.decryptData = decryptData;
