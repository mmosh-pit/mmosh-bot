import { ConversationFlavor } from "@grammyjs/conversations";
import { Context } from "grammy";

export type MyContext = Context & ConversationFlavor & {
  groupId: string
};
