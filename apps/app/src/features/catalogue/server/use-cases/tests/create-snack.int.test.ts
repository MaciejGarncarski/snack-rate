import {
  createSnacksRepository,
  type SnacksRepository,
} from "#/features/catalogue/server/repositories/snacks.repository";
import { createSnackUseCase } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import type { Database } from "#/infrastructure/db/db";
import { createSnackType } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
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
      typeSlug: type.slug,
    };

    const snack = await createSnackUseCase(
      {
        name: input.name,
        description: input.description,
        typeSlug: input.typeSlug,
      },
      [],
      Slug.create(input.name),
      repository,
      db,
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
    expect(dbSnack?.images).toEqual([]);
    expect(dbSnack?.typeId).toBe(type.id);
  });

  it("should create default and thumbnail images when uploading an image", async () => {
    const type = await createSnackType();

    const name = "Snack With Image";

    const snack = await createSnackUseCase(
      {
        name,
        description: "Test",
        typeSlug: type.slug,
      },
      [
        {
          key: "snack-with-image.png",
          thumbKey: "snack-with-image-thumb.png",
          index: 0,
        },
      ],
      Slug.create(name),
      repository,
      db,
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
