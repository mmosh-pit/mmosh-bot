"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBio = void 0;
async function getUserBio(username) {
    // const browser = await puppeteer.launch({
    // headless: "new",
    // executablePath:
    // "./node_modules/puppeteer/.local-chromium/linux-901912/chrome-linux/chrome",
    // });
    // const page = await browser.newPage();
    // await page.goto(`https://t.me/${username}`);
    // await page.setViewport({ width: 1080, height: 1024 });
    // const classNameSelector = ".tgme_page_description";
    // const telegramBioHandle = await page.$(classNameSelector);
    // const bio = await page.evaluate(
    // (element) => element.innerHTML,
    // telegramBioHandle
    // );
    // await telegramBioHandle?.dispose();
    // await browser.close();
    // return bio;
    //
    return "";
}
exports.getUserBio = getUserBio;
