import type { InferSelectModel } from "drizzle-orm/table";

import type { snackItemImages, snackItems } from "#/infrastructure/db/schema";
import { getPrivateFileUrl } from "#/infrastructure/s3-client";

type SnackItem = InferSelectModel<typeof snackItems>;
type ItemImage = InferSelectModel<typeof snackItemImages>;

type SnackItemWithImages = SnackItem & {
  images: ItemImage[];
};

export const snackDTO = async <T extends SnackItemWithImages>(items: T[]) => {
  const cache = new Map<string, Promise<string>>();

  const getCachedUrl = (storageKey: string) => {
    const existing = cache.get(storageKey);
    if (existing) return existing;

    const promise = getPrivateFileUrl(storageKey);
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
