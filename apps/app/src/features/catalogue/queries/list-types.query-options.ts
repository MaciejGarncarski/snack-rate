import { orpc } from "#/orpc/client";

export const listTypesQueryOptions = () =>
  orpc.snacks.listTypes.queryOptions({
    staleTime: 5 * 60 * 1000,
  });
