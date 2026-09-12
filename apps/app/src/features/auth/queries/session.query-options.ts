import ms from "ms";

import { client, orpc } from "#/orpc/client";

export const sessionQueryOptions = () =>
  orpc.auth.getSession.queryOptions({
    staleTime: ms("60s"),
    retry: false,
  });

export type SessionData = Awaited<ReturnType<typeof client.auth.getSession>>;
