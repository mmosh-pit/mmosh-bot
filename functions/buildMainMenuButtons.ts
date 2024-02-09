import { InlineKeyboard } from "grammy";

const webLink = process.env.WEB_LINK!;

const bagsLink = `${webLink}/bags`;
const directoryUrl = `${webLink}/directory`;
const sendTokensUrl = `${webLink}/send_tokens`;
const swapTokensUrl = `${webLink}/swap_coins`;

export const buildMainMenuButtons = (id: number) => [
  [
    InlineKeyboard.text("Earn Rewards 🤑", "next-airdrop"),
    InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Send Tokens 💸", `${sendTokensUrl}?user=${id}`),
    InlineKeyboard.webApp("Swap Tokens 🤝", `${swapTokensUrl}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Display Status 🏆", `${directoryUrl}?user=${id}`),
    InlineKeyboard.url("Join Group 👋", `https://t.me/mmoshpit`),
  ],
  [InlineKeyboard.text("Connect Apps 🔐", "connect-app")],
];
