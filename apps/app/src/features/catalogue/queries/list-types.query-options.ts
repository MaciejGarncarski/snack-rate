import ms from "ms";

import { orpc } from "#/orpc/client";

export const listTypesQueryOptions = () =>
  orpc.snacks.listTypes.queryOptions({
    staleTime: ms("5m"),
  });
