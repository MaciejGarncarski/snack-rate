import { orpc } from "#/orpc/client";

export const snackCommentsQueryOptions = (snackItemId: string) =>
  orpc.comments.list.infiniteOptions({
    staleTime: 30_000,
    input: (pageParam: string | null) => {
      return {
        snackItemId,
        limit: 5,
        cursor: pageParam ?? undefined,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
