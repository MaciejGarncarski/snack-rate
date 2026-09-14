import {
  createSnacksRepository,
  type SnacksRepository,
} from "#/features/catalogue/server/repositories/snacks.repository";
import { createSnackUseCase } from "#/features/catalogue/server/use-cases/create-snack.use-case";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import type { Database } from "#/infrastructure/db/db";
import { createSnackType, createUser } from "#/tests/fixtures";
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

    const snack = await createSnackUseCase({
      input: {
        name: input.name,
        description: input.description,
        typeSlug: input.typeSlug,
      },
      uploadedImages: [],
      slug: Slug.create(input.name),
      userId: null,
      snackRepository: repository,
      db,
    });

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

    const snack = await createSnackUseCase({
      input: {
        name,
        description: "Test",
        typeSlug: type.slug,
      },
      uploadedImages: [
        {
          key: "snack-with-image.png",
          thumbKey: "snack-with-image-thumb.png",
          index: 0,
        },
      ],
      slug: Slug.create(name),
      userId: null,
      snackRepository: repository,
      db,
    });

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

  it("should store the author when created by a user", async () => {
    const type = await createSnackType();
    const author = await createUser();

    const input = {
      name: "Authored Snack",
      typeSlug: type.slug,
    };

    const snack = await createSnackUseCase({
      input,
      uploadedImages: [],
      slug: Slug.create(input.name),
      userId: author.id,
      snackRepository: repository,
      db,
    });

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
    });

    expect(dbSnack?.authorId).toBe(author.id);
  });
});
