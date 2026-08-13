import { getCookie } from "@orpc/server/helpers";
import { setCookie } from "@tanstack/react-start/server";
import { uuidv7 } from "uuidv7";
import z from "zod";

import { cookies } from "#/lib/cookie.config";
import { baseORPC } from "#/lib/orpc/base";

export const sessionMiddleware = baseORPC.middleware(({ context, next }) => {
  const userId = getCookie(context.requestHeaders, cookies.session.name);

  return next({
    context: {
      ...context,
      userId: userId ?? null,
    },
  });
});

const guestIdSchema = z.uuidv7();

export const guestMiddleware = baseORPC.middleware(({ context, next }) => {
  const guestId = getCookie(context.requestHeaders, cookies.guestId.name);
  const parsedGuestId = guestIdSchema.safeParse(guestId);

  if (guestId && parsedGuestId.success) {
    return next({
      context: {
        ...context,
        guestId,
      },
    });
  }

  const newGuestId = uuidv7();
  setCookie(cookies.guestId.name, newGuestId, cookies.guestId.options);

  return next({
    context: {
      ...context,
      guestId: newGuestId,
    },
  });
});
