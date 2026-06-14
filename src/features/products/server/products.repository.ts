import { db } from "#/infrastructure/db/db";

const MAX_SEARCH_RESULTS = 6;

export const productsRepository = {
  search: async (query: string) => {
    const searched = await db.query.snackItems.findMany({
      with: {
        images: true,
      },
      limit: MAX_SEARCH_RESULTS,
      where: {
        OR: [
          {
            name: {
              ilike: `%${query}%`,
            },
          },
          {
            description: {
              ilike: `%${query}%`,
            },
          },
        ],
      },
    });
  },
};
