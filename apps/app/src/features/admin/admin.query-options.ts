import ms from "ms";

import { orpc } from "#/orpc/client";

export function adminCommentsQueryOptions() {
  return orpc.admin.listComments.infiniteOptions({
    staleTime: ms("15s"),
    input: (pageParam: string | null) => ({
      limit: 20,
      cursor: pageParam ?? undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function adminPendingSnacksQueryOptions() {
  return orpc.admin.listPendingSnacks.infiniteOptions({
    staleTime: ms("15s"),
    input: (pageParam: string | null) => ({
      limit: 20,
      cursor: pageParam ?? undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export const adminAuthQueryOptions = orpc.auth.getSession.queryOptions({
  staleTime: ms("120s"),
  retry: false,
});
