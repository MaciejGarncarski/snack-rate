import { db } from "#/infrastructure/db/db";

const MAX_SEARCH_RESULTS = 6;

export const snacksRepository = {
  getBySlug: (slug: string) => {
    return db.query.snackItems.findFirst({
      where: {
        slug: slug,
      },
    });
  },

  list: (limit: number, cursor?: string) => {
    return db.query.snackItems.findMany({
      orderBy: (snackItems, { asc }) => [asc(snackItems.createdAt)],
      limit: limit + 1,
      where: {
        id: { gt: cursor },
      },
      with: {
        brand: true,
        images: true,
        tags: {
          with: {
            tag: true,
          },
          columns: {
            snackItemId: false,
            tagId: false,
          },
        },
      },
    });
  },

  search: (query: string) => {
    return db.query.snackItems.findMany({
      with: {
        images: true,
        brand: true,
        tags: {
          columns: {
            snackItemId: false,
            tagId: false,
          },
          with: { tag: true },
        },
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
