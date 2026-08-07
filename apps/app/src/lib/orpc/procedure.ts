import { baseORPC } from "#/lib/orpc/base";
import { guestMiddleware, sessionMiddleware } from "#/middlewares/auth-middleware.server";
import { mapError } from "#/orpc/map-error";

const errorHandlingMiddleware = baseORPC.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    throw mapError(error);
  }
});

export const baseProcedure = baseORPC
  .use(errorHandlingMiddleware)
  .use(sessionMiddleware)
  .use(guestMiddleware);
