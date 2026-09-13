import ms from "ms";

import { orpc } from "#/orpc/client";

export const COMMENTS_PER_PAGE = 5;

export const snackCommentsQueryOptions = (snackItemId: string) =>
  orpc.comments.list.infiniteOptions({
    staleTime: ms("30s"),
    input: (pageParam: string | null) => {
      return {
        snackItemId,
        limit: COMMENTS_PER_PAGE,
        cursor: pageParam ?? undefined,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
