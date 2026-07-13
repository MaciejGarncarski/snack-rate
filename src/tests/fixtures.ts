import { snackItemImages, snackItems, snackTypes } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { nanoid } from "nanoid";

import { getDb } from "#/tests/setup.int";

type SnackInsert = InferInsertModel<typeof snackItems>;
type SnackTypeInsert = InferInsertModel<typeof snackTypes>;
type SnackImageInsert = InferInsertModel<typeof snackItemImages>;

export async function createSnackType(overrides?: Partial<SnackTypeInsert>) {
  const db = getDb();
  const uniqueSlug = `type-${nanoid(8)}`;
  const uniqueName = `Test Type ${nanoid(8)}`;
  const [type] = await db
    .insert(snackTypes)
    .values({ name: uniqueName, slug: uniqueSlug, ...overrides })
    .returning();
  return type;
}

export async function createSnack(overrides?: Partial<SnackInsert>) {
  const db = getDb();

  let typeId = overrides?.typeId;
  if (!typeId) {
    const type = await createSnackType();
    typeId = type.id;
  }

  const [snack] = await db
    .insert(snackItems)
    .values({
      name: "Test Snack",
      slug: `test-snack-${nanoid(8)}`,
      status: "published",
      price: "2.99",
      typeId,
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
      storageKey: `images/${nanoid(8)}.jpg`,
      type: "default",
      sortOrder: 0,
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
      }),
    ),
  );

  return { snack, images };
}
