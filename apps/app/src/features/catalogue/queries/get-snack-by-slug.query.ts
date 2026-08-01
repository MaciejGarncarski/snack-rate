import { queryOptions } from "@tanstack/react-query";

import { getSnackBySlugFn } from "#/features/catalogue/transport/get-snack-by-slug.server";

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
