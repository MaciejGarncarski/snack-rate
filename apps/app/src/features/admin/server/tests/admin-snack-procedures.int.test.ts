import { createRouterClient } from "@orpc/server";
import { snackItemImages } from "@snack-rate/db-schema/schema";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import {
  deleteSnackImageProcedure,
  getSnackProcedure,
  reorderSnackImagesProcedure,
  updateSnackProcedure,
} from "#/features/admin/admin.routes.server";
import {
  createAdminSnacksRepository,
  type AdminSnacksRepository,
} from "#/features/admin/server/admin-snacks.repository";
import { createSnack, createSnackType } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn<(options: { headers: Headers }) => Promise<unknown>>(),
  repository: null as unknown as AdminSnacksRepository,
}));

// oxlint-disable-next-line anti-slop/no-module-mocking -- cookie options read serverEnv at import time, which is unavailable in tests; the cookie name stays real
vi.mock("#/lib/cookie.config", () => ({
  cookies: {
    guestId: {
      name: "guest_id",
      options: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 31536000, path: "/" },
    },
    adminAuth: {
      name: "admin_auth",
      options: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 86400, path: "/" },
    },
  },
}));

// oxlint-disable-next-line anti-slop/no-module-mocking -- procedure test must not boot better-auth against the prod DB
vi.mock("#/lib/auth.ts", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

// oxlint-disable-next-line anti-slop/no-module-mocking -- the singleton binds the prod DB at import time; tests use an isolated DB instead
vi.mock("#/features/admin/server/admin.repository.instance", () => ({
  get adminRepository() {
    if (!mocks.repository) {
      throw new Error("adminRepository accessed before test setup");
    }
    return mocks.repository;
  },
}));

beforeAll(() => {
  mocks.repository = createAdminSnacksRepository({
    db: getDb(),
    getFileUrl: noopGetFileUrl,
    deleteFile: () => Promise.resolve(),
  });
});

function adminSession(userId = "admin-1") {
  mocks.getSession.mockReset().mockResolvedValue({ user: { id: userId, role: "admin" } });
}

function createCaller() {
  return createRouterClient(
    {
      admin: {
        getSnack: getSnackProcedure,
        updateSnack: updateSnackProcedure,
        reorderSnackImages: reorderSnackImagesProcedure,
        deleteSnackImage: deleteSnackImageProcedure,
      },
    },
    {
      context: {
        requestHeaders: new Headers({ cookie: `guest_id=${uuidv7()}` }),
        guestId: null,
        userId: null,
        role: "guest" as const,
      },
    },
  );
}

async function createPendingSnackWithImages(imageCount: number) {
  const snack = await createSnack({ status: "pending", name: "Do moderacji" });
  const db = getDb();
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

describe("admin snack procedures", () => {
  it("should return the snack detail for admins", async () => {
    adminSession();
    const snack = await createPendingSnackWithImages(1);
    const caller = createCaller();

    const result = await caller.admin.getSnack({ snackItemId: snack.id });

    expect(result.snack).toMatchObject({ id: snack.id, status: "pending" });
    expect(result.snack.images).toHaveLength(2);
  });

  it("should reject non-admin callers with UNAUTHORIZED", async () => {
    mocks.getSession.mockReset().mockResolvedValue({ user: { id: "user-1", role: "user" } });
    const caller = createCaller();

    await expect(caller.admin.getSnack({ snackItemId: uuidv7() })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("should return NOT_FOUND for a missing snack", async () => {
    adminSession();
    const caller = createCaller();

    await expect(caller.admin.getSnack({ snackItemId: uuidv7() })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("should update the snack and return the detail", async () => {
    adminSession();
    const snack = await createSnack({ status: "pending", name: "Stara" });
    const type = await createSnackType();
    const caller = createCaller();

    const result = await caller.admin.updateSnack({
      snackItemId: snack.id,
      name: "Nowa",
      description: "Opis",
      typeId: type.id,
    });

    expect(result.snack).toMatchObject({ id: snack.id, name: "Nowa", typeId: type.id });
  });

  it("should reject invalid update input with BAD_REQUEST", async () => {
    adminSession();
    const snack = await createSnack({ status: "pending" });
    const caller = createCaller();

    await expect(
      caller.admin.updateSnack({
        snackItemId: snack.id,
        name: "",
        description: null,
        typeId: snack.typeId,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("should reorder images through the procedure", async () => {
    adminSession();
    const snack = await createPendingSnackWithImages(2);
    const db = getDb();
    const rows = await db.query.snackItemImages.findMany({
      where: { snackItemId: snack.id },
    });
    const reversed = rows
      .filter((row) => row.type === "default")
      .toSorted((a, b) => b.sortOrder - a.sortOrder)
      .map((row) => row.id);
    const caller = createCaller();

    const result = await caller.admin.reorderSnackImages({
      snackItemId: snack.id,
      orderedImageIds: reversed,
    });

    expect(
      result.snack?.images.filter((img) => img.type === "default").map((img) => img.id),
    ).toEqual(reversed);
  });

  it("should delete an image through the procedure", async () => {
    adminSession();
    const snack = await createPendingSnackWithImages(1);
    const db = getDb();
    const rows = await db.query.snackItemImages.findMany({
      where: { snackItemId: snack.id },
    });
    const defaultImages = rows.filter((row) => row.type === "default");
    expect(defaultImages).toHaveLength(1);
    const caller = createCaller();

    const result = await caller.admin.deleteSnackImage({
      snackItemId: snack.id,
      imageId: defaultImages[0].id,
    });

    expect(result.snack?.images).toHaveLength(0);
  });

  it("should return NOT_FOUND when deleting an unknown image", async () => {
    adminSession();
    const snack = await createSnack({ status: "pending" });
    const caller = createCaller();

    await expect(
      caller.admin.deleteSnackImage({ snackItemId: snack.id, imageId: uuidv7() }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
