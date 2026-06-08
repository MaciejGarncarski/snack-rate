import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { requestLoggerMiddleware } from "#/middlewares/request-logger";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, requestLoggerMiddleware],
}));
