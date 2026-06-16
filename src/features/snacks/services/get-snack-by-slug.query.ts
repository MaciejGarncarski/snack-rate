import { queryOptions } from "@tanstack/react-query";

import { getSnackBySlug } from "#/features/snacks/api/snacks.api";

export const getSnackBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["snack", slug],
    queryFn: () => {
      return getSnackBySlug({
        data: { slug },
      });
    },
  });
