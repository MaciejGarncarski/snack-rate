import { queryOptions } from "@tanstack/react-query";

import { getSnackBySlugFn } from "#/features/catalogue/api/snacks.api";

export const getSnackBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["snack", slug],
    queryFn: () => {
      return getSnackBySlugFn({
        data: { slug },
      });
    },
    select: (data) => data!,
  });
