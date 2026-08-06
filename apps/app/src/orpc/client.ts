import { createORPCClient, createSafeClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import router from "#/orpc/router";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        request: getRequest(),
        guestId: null,
        userId: null,
      }),
    }),
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    });
    return createORPCClient(link);
  });

export const client: RouterClient<typeof router> = getORPCClient();
export const safeClient = createSafeClient(client);
export const orpc = createTanstackQueryUtils(client);
