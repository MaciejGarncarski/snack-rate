import type { InferInsertModel } from "drizzle-orm";

import { brands, snackItemImages, snackItems, snackTypes } from "#/infrastructure/db/schema";
import { getDb } from "#/tests/setup";

type BrandInsert = InferInsertModel<typeof brands>;
type SnackInsert = InferInsertModel<typeof snackItems>;
type SnackTypeInsert = InferInsertModel<typeof snackTypes>;
type SnackImageInsert = InferInsertModel<typeof snackItemImages>;

export async function createBrand(overrides?: Partial<BrandInsert>) {
  const db = getDb();
  const [brand] = await db
    .insert(brands)
    .values({ name: "Test Brand", ...overrides })
    .returning();
  return brand;
}

export async function createSnackType(overrides?: Partial<SnackTypeInsert>) {
  const db = getDb();
  const uniqueSlug = `type-${crypto.randomUUID().slice(0, 8)}`;
  const [type] = await db
    .insert(snackTypes)
    .values({ name: "Test Type", slug: uniqueSlug, ...overrides })
    .returning();
  return type;
}

export async function createSnack(overrides?: Partial<SnackInsert>) {
  const db = getDb();

  let brandId = overrides?.brandId;
  if (!brandId) {
    const brand = await createBrand();
    brandId = brand.id;
  }

  const [snack] = await db
    .insert(snackItems)
    .values({
      brandId,
      name: "Test Snack",
      slug: `test-snack-${crypto.randomUUID().slice(0, 8)}`,
      status: "published",
      price: "2.99",
      ...overrides,
    })
    .returning();
  return snack;
}

export async function createSnackImage(snackId: string, overrides?: Partial<SnackImageInsert>) {
  const db = getDb();
  const [image] = await db
    .insert(snackItemImages)
    .values({
      snackItemId: snackId,
      storageKey: `images/${crypto.randomUUID().slice(0, 8)}.jpg`,
      sortOrder: 0,
      isPrimary: false,
      ...overrides,
    })
    .returning();
  return image;
}

export async function createSnackWithImages(
  imageCount: number,
  snackOverrides?: Partial<SnackInsert>,
) {
  const snack = await createSnack(snackOverrides);

  const images = await Promise.all(
    Array.from({ length: imageCount }, (_, i) =>
      createSnackImage(snack.id, {
        sortOrder: i,
        isPrimary: i === 0,
      }),
    ),
  );

  return { snack, images };
}
