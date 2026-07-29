import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { errorHandlingMiddleware } from "#/middlewares/error-handling.server";
import { requestLoggerMiddleware } from "#/middlewares/request-logger.server";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, requestLoggerMiddleware],
  functionMiddleware: [errorHandlingMiddleware],
}));
