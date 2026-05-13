import { createStart } from "@tanstack/react-start";

import { requestLoggerMiddleware } from "#/middlewares/request-logger";

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLoggerMiddleware],
}));
