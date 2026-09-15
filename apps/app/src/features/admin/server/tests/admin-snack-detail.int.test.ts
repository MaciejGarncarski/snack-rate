import { snackItemImages } from "@snack-rate/db-schema/schema";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import {
  createAdminSnacksRepository,
  type AdminSnacksRepository,
} from "#/features/admin/server/admin-snacks.repository";
import type { Database } from "#/infrastructure/db/db";
import { createSnack, createSnackImage, createSnackType } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
let repository: AdminSnacksRepository;
let deletedKeys: string[];

beforeAll(() => {
  db = getDb();
  deletedKeys = [];
  repository = createAdminSnacksRepository({
    db,
    getFileUrl: noopGetFileUrl,
    deleteFile: vi.fn<(key: string) => Promise<void>>((key: string) => {
      deletedKeys.push(key);
      return Promise.resolve();
    }),
  });
});

beforeEach(() => {
  deletedKeys = [];
});

async function createPendingSnackWithImages(imageCount: number) {
  const snack = await createSnack({ status: "pending", name: "Do moderacji" });
  for (let index = 0; index < imageCount; index += 1) {
    await db.insert(snackItemImages).values([
      {
        snackItemId: snack.id,
        storageKey: `pending/${snack.id}/${index}.webp`,
        type: "default",
        sortOrder: index,
      },
      {
        snackItemId: snack.id,
        storageKey: `pending/${snack.id}/${index}-thumb.webp`,
        type: "thumbnail",
        sortOrder: index,
      },
    ]);
  }
  return snack;
}

describe("admin snack detail", () => {
  it("should return the snack with images sorted by sortOrder", async () => {
    const snack = await createPendingSnackWithImages(2);

    const detail = await repository.getSnack(snack.id);

    expect(detail).toMatchObject({
      id: snack.id,
      name: "Do moderacji",
      slug: snack.slug,
      status: "pending",
    });
    expect(detail?.images.filter((img) => img.type === "default")).toHaveLength(2);
    expect(
      detail?.images.filter((img) => img.type === "default").map((img) => img.sortOrder),
    ).toEqual([0, 1]);
    expect(detail?.images[0]?.url).toContain("https://test.com/");
  });

  it("should return null for a missing snack", async () => {
    expect(await repository.getSnack(uuidv7())).toBeNull();
  });

  it("should update name, description and type while keeping the slug", async () => {
    const snack = await createSnack({ status: "pending", name: "Stara nazwa" });
    const otherType = await createSnackType();

    const result = await repository.updateSnack({
      snackItemId: snack.id,
      name: "  Nowa nazwa  ",
      description: "Nowy opis",
      typeId: otherType.id,
    });

    expect(result.status).toBe("ok");
    expect(result).toMatchObject({
      status: "ok",
      snack: {
        id: snack.id,
        name: "  Nowa nazwa  ",
        description: "Nowy opis",
        typeId: otherType.id,
        typeName: otherType.name,
        slug: snack.slug,
      },
    });
  });

  it("should clear the description when null is passed", async () => {
    const snack = await createSnack({
      status: "pending",
      description: "Jakiś opis",
    });

    const result = await repository.updateSnack({
      snackItemId: snack.id,
      name: snack.name,
      description: null,
      typeId: snack.typeId,
    });

    expect(result.status).toBe("ok");
    expect(result).toMatchObject({
      status: "ok",
      snack: { id: snack.id, description: null },
    });
  });

  it("should return not-found for a missing snack", async () => {
    const type = await createSnackType();

    const result = await repository.updateSnack({
      snackItemId: uuidv7(),
      name: "Nazwa",
      description: null,
      typeId: type.id,
    });

    expect(result).toEqual({ status: "not-found" });
  });

  it("should return unknown-type for a missing snack type", async () => {
    const snack = await createSnack({ status: "pending" });

    const result = await repository.updateSnack({
      snackItemId: snack.id,
      name: snack.name,
      description: null,
      typeId: uuidv7(),
    });

    expect(result).toEqual({ status: "unknown-type" });
  });
});

describe("admin snack images", () => {
  it("should reorder image pairs by default ids", async () => {
    const snack = await createPendingSnackWithImages(3);
    const rows = await db.query.snackItemImages.findMany({
      where: { snackItemId: snack.id },
    });
    const defaultIds = rows
      .filter((row) => row.type === "default")
      .toSorted((a, b) => b.sortOrder - a.sortOrder)
      .map((row) => row.id);
    const reversed = [defaultIds[2], defaultIds[1], defaultIds[0]];

    const ok = await repository.reorderSnackImages(snack.id, reversed);

    expect(ok).toBe(true);
    const detail = await repository.getSnack(snack.id);
    expect(detail?.images.filter((img) => img.type === "default").map((img) => img.id)).toEqual(
      reversed,
    );
    expect(
      detail?.images.filter((img) => img.type === "default").map((img) => img.sortOrder),
    ).toEqual([0, 1, 2]);
    expect(detail?.images.map((img) => img.sortOrder)).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it("should reject an incomplete ordering", async () => {
    const snack = await createPendingSnackWithImages(2);

    const ok = await repository.reorderSnackImages(snack.id, [uuidv7()]);

    expect(ok).toBe(false);
  });

  it("should soft-delete the image pair and compact sort orders", async () => {
    const snack = await createPendingSnackWithImages(3);
    const rows = await db.query.snackItemImages.findMany({
      where: { snackItemId: snack.id },
    });
    const middleDefaults = rows
      .filter((row) => row.type === "default")
      .filter((row) => row.sortOrder === 1);
    expect(middleDefaults).toHaveLength(1);

    const result = await repository.deleteSnackImage(snack.id, middleDefaults[0].id);

    expect(result).not.toBeNull();
    expect(result!.deletedKeys).toHaveLength(2);
    expect([...result!.deletedKeys].toSorted()).toEqual([...deletedKeys].toSorted());

    const detail = await repository.getSnack(snack.id);
    expect(detail).not.toBeNull();
    const defaults = detail!.images.filter((img) => img.type === "default");
    expect(defaults).toHaveLength(2);
    expect(defaults.map((img) => img.sortOrder)).toEqual([0, 1]);
  });

  it("should return null for an unknown image", async () => {
    const snack = await createSnack({ status: "pending" });
    await createSnackImage(snack.id);

    const result = await repository.deleteSnackImage(snack.id, uuidv7());

    expect(result).toBeNull();
    expect(deletedKeys).toHaveLength(0);
  });
});
