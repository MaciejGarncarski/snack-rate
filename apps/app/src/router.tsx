import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { DefaultErrorComponent } from "#/components/layout/default-error";
import { DefaultNotFound } from "#/components/layout/default-not-found";
import {
  sessionQueryOptions,
  type SessionData,
} from "#/features/auth/queries/session.query-options";
import { routeTree } from "#/routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
  ensureSession: () => Promise<SessionData>;
};

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      ensureSession: () => queryClient.query({ ...sessionQueryOptions(), staleTime: "static" }),
    } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <DefaultNotFound />,
    defaultErrorComponent: DefaultErrorComponent,
    defaultPendingComponent: () => <div>Wczytywanie...</div>,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
