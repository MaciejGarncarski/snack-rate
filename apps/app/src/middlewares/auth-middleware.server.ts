import { ORPCError } from "@orpc/server";
import { getCookie } from "@orpc/server/helpers";
import { setCookie } from "@tanstack/react-start/server";
import { uuidv7 } from "uuidv7";
import * as z from "zod";

import { auth } from "#/lib/auth.ts";
import { cookies } from "#/lib/cookie.config";
import { baseORPC } from "#/lib/orpc/base";

const guestIdSchema = z.uuidv7();
const userRoleSchema = z.enum(["guest", "user", "admin"]);

export const authMiddleware = baseORPC.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({
    headers: context.requestHeaders,
  });

  const guestId = getCookie(context.requestHeaders, cookies.guestId.name);
  const parsedGuestId = guestIdSchema.safeParse(guestId);

  const resolvedGuestId = parsedGuestId.success ? parsedGuestId.data : uuidv7();

  if (!parsedGuestId.success) {
    setCookie(cookies.guestId.name, resolvedGuestId, cookies.guestId.options);
  }

  const parseUserRole = userRoleSchema.safeParse(session?.user?.role ?? "guest");

  return next({
    context: {
      ...context,
      userId: session?.user?.id ?? null,
      role: parseUserRole.success ? parseUserRole.data : "guest",
      guestId: resolvedGuestId,
    },
  });
});

export const adminAuthMiddleware = baseORPC.middleware(({ context, next }) => {
  const isAdmin = context.role === "admin";

  if (!isAdmin) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized: Admin access required" });
  }

  return next();
});
