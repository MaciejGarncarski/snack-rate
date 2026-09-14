import { snackComments } from "@snack-rate/db-schema/schema";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import {
  createAdminRepository,
  type AdminRepository,
} from "#/features/admin/server/admin.repository";
import type { Database } from "#/infrastructure/db/db";
import { createSnack, createSnackImage, createUser } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
let repository: AdminRepository;

beforeAll(() => {
  db = getDb();
  repository = createAdminRepository({ db, getFileUrl: noopGetFileUrl });
});

describe("admin snack moderation", () => {
  it("lists only pending snacks", async () => {
    const pending = await createSnack({ status: "pending" });
    const published = await createSnack({ status: "published" });
    const rejected = await createSnack({ status: "rejected" });

    const result = await repository.listPendingSnacks({ limit: 20, cursor: null });

    const ids = result.snacks.map((s) => s.id);
    expect(ids).toContain(pending.id);
    expect(ids).not.toContain(published.id);
    expect(ids).not.toContain(rejected.id);
    expect(result.snacks.every((s) => s.id !== undefined)).toBe(true);
  });

  it("lists comments with author and snack details", async () => {
    const snack = await createSnack({ name: "Admin Test Snack" });
    const author = await createUser({ name: "  Anna Admin  " });
    const [comment] = await db
      .insert(snackComments)
      .values({
        snackItemId: snack.id,
        authorId: author.id,
        authorType: "user",
        body: "Great snack",
        rating: 8,
      })
      .returning();

    const result = await repository.listComments({ limit: 10 });
    const listed = result.comments.find((item) => item.id === comment.id);

    expect(listed).toMatchObject({
      id: comment.id,
      body: "Great snack",
      rating: 8,
      authorName: "Anna Admin",
      authorType: "user",
      snackName: "Admin Test Snack",
      snackSlug: snack.slug,
    });
  });

  it("uses a guest fallback name and skips deleted comments", async () => {
    const snack = await createSnack();
    const [guestComment, deletedComment] = await db
      .insert(snackComments)
      .values([
        {
          snackItemId: snack.id,
          authorId: uuidv7(),
          authorType: "guest",
          body: "Guest comment",
        },
        {
          snackItemId: snack.id,
          authorId: uuidv7(),
          authorType: "guest",
          body: "Deleted comment",
          deletedAt: new Date(),
        },
      ])
      .returning();

    const result = await repository.listComments({ limit: 10 });
    expect(result.comments.find((item) => item.id === guestComment.id)?.authorName).toBe("Gość");
    expect(result.comments.some((item) => item.id === deletedComment.id)).toBe(false);
  });

  it("paginates comments with a cursor", async () => {
    const snack = await createSnack();
    await db
      .insert(snackComments)
      .values(
        ["first", "second", "third"].map((body) => ({
          snackItemId: snack.id,
          authorId: uuidv7(),
          authorType: "guest",
          body,
        })),
      )
      .returning();

    const firstPage = await repository.listComments({ limit: 1 });
    expect(firstPage.comments).toHaveLength(1);
    expect(firstPage.nextCursor).not.toBeNull();

    const secondPage = await repository.listComments({ limit: 1, cursor: firstPage.nextCursor });
    expect(secondPage.comments).toHaveLength(1);
    expect(secondPage.comments[0].id).not.toBe(firstPage.comments[0].id);
  });

  it("soft-deletes a comment and recalculates the snack rating", async () => {
    const snack = await createSnack({ avgRating: "6", ratingCount: 2 });
    const comments = await db
      .insert(snackComments)
      .values([
        { snackItemId: snack.id, authorId: uuidv7(), authorType: "guest", rating: 4 },
        { snackItemId: snack.id, authorId: uuidv7(), authorType: "guest", rating: 8 },
      ])
      .returning();

    await expect(repository.deleteComment(comments[0].id)).resolves.toBe(snack.id);
    await expect(repository.deleteComment(comments[0].id)).resolves.toBeNull();

    const updatedSnack = await db.query.snackItems.findFirst({ where: { id: snack.id } });
    const deleted = await db.query.snackComments.findFirst({ where: { id: comments[0].id } });
    expect(deleted?.deletedAt).not.toBeNull();
    expect(updatedSnack?.avgRating).toBe("8.00");
    expect(updatedSnack?.ratingCount).toBe(1);
  });

  it("maps pending snack images and returns a cursor", async () => {
    await createSnack({ status: "pending" });
    const first = await createSnack({ status: "pending" });
    await createSnackImage(first.id, { storageKey: "admin/first.jpg", type: "default" });
    await createSnack({ status: "pending" });

    const getFileUrl = vi.fn<(key: string) => Promise<string>>(noopGetFileUrl);
    const admin = createAdminRepository({ db, getFileUrl });
    const result = await admin.listPendingSnacks({ limit: 1 });

    expect(result.snacks).toHaveLength(1);
    expect(result.nextCursor).not.toBeNull();
  });

  it("accepts a pending snack", async () => {
    const snack = await createSnack({ status: "pending" });

    const status = await repository.reviewSnack(snack.id, "accept");

    expect(status).toBe("published");
    const row = await db.query.snackItems.findFirst({ where: { id: snack.id } });
    expect(row?.status).toBe("published");
  });

  it("rejects a pending snack", async () => {
    const snack = await createSnack({ status: "pending" });

    const status = await repository.reviewSnack(snack.id, "reject");

    expect(status).toBe("rejected");
  });

  it("returns null when reviewing an already-reviewed or missing snack", async () => {
    const snack = await createSnack({ status: "pending" });

    expect(await repository.reviewSnack(snack.id, "accept")).toBe("published");
    expect(await repository.reviewSnack(snack.id, "reject")).toBeNull();
    expect(
      await repository.reviewSnack("00000000-0000-0000-0000-000000000000", "accept"),
    ).toBeNull();
  });
});
