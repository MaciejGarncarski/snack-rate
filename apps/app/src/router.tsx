import { RPCJsonSerializer } from "@orpc/client";
import { QueryClient, hashKey } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { DefaultErrorComponent } from "#/components/layout/default-error";
import { DefaultNotFound } from "#/components/layout/default-not-found";
import { routeTree } from "#/routeTree.gen";

const serializer = new RPCJsonSerializer();

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        queryKeyHashFn: (queryKey) => {
          const { json, meta } = serializer.serialize(queryKey);

          return hashKey([json, meta?.map((entry) => JSON.stringify(entry)).toSorted()]);
        },
      },
      dehydrate: {
        serializeData: (data) => {
          const { json, meta } = serializer.serialize(data);

          return { json, meta };
        },
      },
      hydrate: {
        deserializeData: (data) => serializer.deserialize(data),
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    scrollRestorationBehavior: "smooth",
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
