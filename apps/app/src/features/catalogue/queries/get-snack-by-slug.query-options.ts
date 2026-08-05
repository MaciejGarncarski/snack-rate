import { queryOptions } from "@tanstack/react-query";

import { client } from "#/orpc/client";

export const getSnackBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["snack", slug],
    queryFn: () => {
      return client.snacks.getBySlug({ slug });
    },
    select: (data) => data!,
  });
