import ms from "ms";

import { orpc } from "#/orpc/client";

export const COMMENTS_PER_PAGE = 5;

export const REPLIES_PER_PAGE = 5;

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

export const commentRepliesQueryOptions = (commentId: string) =>
  orpc.comments.listReplies.infiniteOptions({
    staleTime: ms("30s"),
    input: (pageParam: string | null) => {
      return {
        commentId,
        limit: REPLIES_PER_PAGE,
        cursor: pageParam ?? undefined,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
