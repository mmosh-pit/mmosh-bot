import "dotenv/config";
import * as fs from "fs";
const path = require("path");

export function readConfigFile(filePath: string): any {
  try {
    const absolutePath = path.join(__dirname, filePath);
    const data = fs.readFileSync(absolutePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    //console.error(`Error reading configuration file: ${error.message}`);
    return null;
  }
}
