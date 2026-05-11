import { createMiddleware, createStart } from "@tanstack/react-start";

export const requestLogger = createMiddleware({ type: "request" }).server(async ({ next }) => {
  console.log("Request received at", new Date().toISOString());
  const res = await next();
  console.log("Response sent at", new Date().toISOString());
  return res;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger],
}));
