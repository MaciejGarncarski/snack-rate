import { baseORPC } from "#/lib/orpc/base";
import { guestMiddleware, sessionMiddleware } from "#/middlewares/auth-middleware.server";

export const baseProcedure = baseORPC.use(sessionMiddleware).use(guestMiddleware);
