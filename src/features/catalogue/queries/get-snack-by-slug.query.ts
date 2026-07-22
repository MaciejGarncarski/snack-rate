import { getSnackBySlugFn } from "#/features/catalogue/api/snacks.api";
import { queryOptions } from "@tanstack/react-query";

export const getSnackBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["snack", slug],
    queryFn: () => {
      return getSnackBySlugFn({
        data: { slug },
      });
    },
  });
