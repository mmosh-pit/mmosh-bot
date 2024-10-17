import { InlineKeyboard } from "grammy";

const webLink = process.env.WEB_LINK!;
const webAppLink = process.env.WEB_APP_LINK!;

export const bagsLink = `${webLink}/bags`;
export const sendTokensUrl = `${webLink}/send_tokens`;
export const swapTokensUrl = `${webLink}/swap_coins`;

export const coinsLinkUrl = `${webLink}/coins`;
export const communitiesUrl = `${webLink}/communities`;
// const projectsUrl = `${webAppLink}/projects`;
export const membersUrl = `${webLink}/members`;
export const atmUrl = `${webAppLink}/atm`;
export const rewardsUrl = `${webLink}/rewards`;
export const settingsUrl = `${webLink}/settings`;

export const joinClubUrl = `${webLink}/create/profile`;

export const myProfileUrl = `${webLink}/my-profile`;

export const buildMainMenuButtons = (id: number) => [
  [InlineKeyboard.webApp("Coins", `${coinsLinkUrl}?user=${id}`)],
  [
    InlineKeyboard.webApp("Communities", `${communitiesUrl}?user=${id}`),
    InlineKeyboard.webApp("Members", `${membersUrl}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Settings", `${settingsUrl}?user=${id}`),
    InlineKeyboard.webApp("Wallets 💰", `${bagsLink}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Send 💸", `${sendTokensUrl}?user=${id}`),
    InlineKeyboard.webApp("Swap 🤝", `${swapTokensUrl}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Rewards", `${rewardsUrl}?user=${id}`),
    InlineKeyboard.url("Join Group 👋", `https://t.me/mmoshpit`),
  ],
  [
    InlineKeyboard.url("ATM", atmUrl),
    InlineKeyboard.webApp("My profile", `${myProfileUrl}?user=${id}`),
  ],
  [
    InlineKeyboard.webApp("Join the Club", `${joinClubUrl}?user=${id}`),
    // InlineKeyboard.url("Quests", coinsLinkUrl),
  ],
];
