import { getCookie } from "@orpc/server/helpers";
import { setCookie } from "@tanstack/react-start/server";
import { nanoid } from "nanoid";

import { cookies } from "#/lib/cookie.config";
import { baseORPC } from "#/lib/orpc/base";

export const sessionMiddleware = baseORPC.middleware(({ context, next }) => {
  const userId = getCookie(context.request.headers, cookies.session.name);

  return next({
    context: {
      ...context,
      userId: userId ?? null,
    },
  });
});

export const guestMiddleware = baseORPC.middleware(({ context, next }) => {
  const guestId = getCookie(context.request.headers, cookies.guestId.name);

  if (guestId) {
    return next({
      context: {
        ...context,
        guestId,
      },
    });
  }

  const newGuestId = nanoid(32);
  setCookie(cookies.guestId.name, newGuestId, cookies.guestId.options);

  return next({
    context: {
      ...context,
      guestId: newGuestId,
    },
  });
});
