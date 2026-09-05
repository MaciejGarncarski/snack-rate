import ms from "ms";

import { orpc } from "#/orpc/client";
import type { SortBy } from "#/schemas/catalogue";

export const PRODUCTS_PER_SCROLL = 8;

export const listSnacksQueryOptions = (opts?: { typeSlug?: string | null; sortBy?: SortBy }) => {
  const typeSlug = opts?.typeSlug ?? undefined;
  const sortBy = opts?.sortBy ?? undefined;
  return orpc.snacks.list.infiniteOptions({
    staleTime: ms("5m"),
    input: (pageParam: string | null) => {
      return {
        limit: PRODUCTS_PER_SCROLL,
        cursor: pageParam ?? undefined,
        typeSlug,
        sortBy,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
