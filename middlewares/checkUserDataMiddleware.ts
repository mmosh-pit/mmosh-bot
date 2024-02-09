import { Context, NextFunction } from "grammy";
import { getUserFromDB } from "../utils/users/getUserFromDB";
import { updateUserData } from "../utils/users/updateUserData";

export const checkUserDataMiddleware = async (
  ctx: Context,
  next: NextFunction,
) => {
  await next();

  const from = ctx.from;

  if (!from) return;

  const userData = await getUserFromDB(from.id);

  if (
    userData?.username !== from.username ||
    userData?.firstName !== from.first_name ||
    userData?.lastName !== from.last_name
  ) {
    await updateUserData(
      from.id,
      from.first_name,
      from.last_name || "",
      from.username || "",
    );
  }
};
