import { baseORPC } from "#/lib/orpc/base";
import { guestMiddleware, sessionMiddleware } from "#/middlewares/auth-middleware.server";
import { logger } from "#/observability/logger/logger";
import { sanitizeRequestData } from "#/observability/request-context";
import { mapError } from "#/orpc/map-error";

const INPUT_PATHS = new Set(["snacks.search"]);

const WRITE_PATHS = new Set(["snacks.create", "comments.rate", "comments.removeRating"]);

function shouldLogInput(path: string[]): boolean {
  const joined = path.join(".");
  return WRITE_PATHS.has(joined) || INPUT_PATHS.has(joined);
}

const errorHandlingMiddleware = baseORPC.middleware(async ({ next, path }, input) => {
  const captureInput = shouldLogInput(path);

  try {
    const result = await next();

    if (captureInput && input !== undefined) {
      logger.info(
        {
          procedure: path.join("."),
          input: sanitizeRequestData(input),
        },
        "RPC request completed",
      );
    }

    return result;
  } catch (error) {
    const meta: Record<string, unknown> = {
      err: error,
      cause: (error as Error).cause,
      procedure: path.join("."),
    };
    if (input !== undefined) {
      meta.input = sanitizeRequestData(input);
    }
    logger.error(meta, "RPC handler error");
    throw mapError(error);
  }
});

export const baseProcedure = baseORPC
  .use(errorHandlingMiddleware)
  .use(sessionMiddleware)
  .use(guestMiddleware);
