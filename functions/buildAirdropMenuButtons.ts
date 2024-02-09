import { InlineKeyboard } from "grammy";

export const buildAirdropMenuButtons = (id: number) => [
  [
    InlineKeyboard.text("Join Airdrip 💧", "join-airdrip"),
    InlineKeyboard.text("Show my Link 🔗", `show-link`),
  ],
];
