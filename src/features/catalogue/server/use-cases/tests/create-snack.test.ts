import {
  createSnacksRepository,
  type SnacksRepository,
} from "#/features/catalogue/server/repositories/snacks.repository";
import { createSnack } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import type { Db } from "#/infrastructure/db/db";
import { createSnackType } from "#/tests/fixtures";
import { getDb } from "#/tests/setup";
import { noopGetFileUrl } from "#/tests/utils";

let db: Db;
let repository: SnacksRepository;

beforeAll(() => {
  db = getDb();
  repository = createSnacksRepository({
    db,
    getFileUrl: noopGetFileUrl,
  });
});

describe("create snack", () => {
  it("should create a snack with valid input", async () => {
    const type = await createSnackType();

    const input = {
      name: "Test Snack",
      description: "A delicious test snack",
      price: 2.99,
      typeSlug: type.slug,
      images: [],
    };

    const snack = await createSnack(
      {
        images: input.images,
        name: input.name,
        description: input.description,
        price: input.price,
        typeSlug: input.typeSlug,
      },
      repository,
    );

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
      with: {
        images: true,
        type: true,
      },
    });

    expect(dbSnack).not.toBeNull();
    expect(dbSnack?.name).toBe(input.name);
    expect(dbSnack?.description).toBe(input.description);
    expect(dbSnack?.price).toBe(String(input.price));
    expect(dbSnack?.images).toEqual([]);
    expect(dbSnack?.typeId).toBe(type.id);
  });

  it("should create default and thumbnail images when uploading an image", async () => {
    const type = await createSnackType();
    const mockImage = new Blob([new Uint8Array(100)], { type: "image/png" });

    const snack = await createSnack(
      {
        images: [mockImage],
        name: "Snack With Image",
        description: "Test",
        price: 1.99,
        typeSlug: type.slug,
      },
      repository,
    );

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
      with: {
        images: true,
      },
    });

    expect(dbSnack?.images).toHaveLength(2);
    expect(dbSnack?.images[0].type).toBe("default");
    expect(dbSnack?.images[1].type).toBe("thumbnail");
  });
});
