import type { InferSelectModel } from "drizzle-orm/table";

import { getFileUrl } from "#/lib/s3.server";
import type { snackItemImages, snackItems } from "#/server/db/schema";

type SnackItem = InferSelectModel<typeof snackItems>;
type ItemImage = InferSelectModel<typeof snackItemImages>;

type SnackItemWithImages = SnackItem & {
  images: ItemImage[];
};

export const hydrateSnackItemImages = async <T extends SnackItemWithImages>(items: T[]) => {
  const cache = new Map<string, Promise<string>>();

  const getCachedUrl = (storageKey: string) => {
    const existing = cache.get(storageKey);
    if (existing) return existing;

    const promise = getFileUrl(storageKey);
    cache.set(storageKey, promise);
    return promise;
  };

  const mappedItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      images: await Promise.all(
        item.images.map(async (img) => ({
          ...img,
          url: await getCachedUrl(img.storageKey),
        })),
      ),
    })),
  );

  return mappedItems;
};
