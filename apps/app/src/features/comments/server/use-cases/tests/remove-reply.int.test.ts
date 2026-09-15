import { snackComments } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { listCommentRepliesUseCase } from "#/features/comments/server/use-cases/list-comment-replies.use-case";
import { removeReplyUseCase } from "#/features/comments/server/use-cases/remove-reply.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createCommentsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createCommentsRepository({ db });
});

async function insertParentComment(
  snackItemId: string,
  overrides?: Partial<InferInsertModel<typeof snackComments>>,
) {
  const [comment] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      rating: 7,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Recenzja",
      ...overrides,
    })
    .returning();
  return comment;
}

async function insertReply(
  snackItemId: string,
  parentCommentId: string,
  overrides?: Partial<InferInsertModel<typeof snackComments>>,
) {
  const [reply] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      parentCommentId,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Odpowiedź",
      ...overrides,
    })
    .returning();
  return reply;
}

describe("remove reply", () => {
  it("should soft-delete an own reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const authorId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId });

    await removeReplyUseCase({ replyId: reply.id, authorId }, repository);

    const stored = await repository.getReplyById(reply.id);
    expect(stored?.deletedAt).not.toBeNull();

    const listed = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);
    expect(listed.items).toEqual([]);
  });

  it("should keep other replies of the same comment", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const authorId = uuidv7();
    const removed = await insertReply(snack.id, parent.id, { authorId, body: "Do usunięcia" });
    const kept = await insertReply(snack.id, parent.id, { authorId, body: "Zostaje" });

    await removeReplyUseCase({ replyId: removed.id, authorId }, repository);

    const listed = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);
    expect(listed.items.map((item) => item.id)).toEqual([kept.id]);
  });

  it("should throw NOT_FOUND for a missing reply", async () => {
    await expect(
      removeReplyUseCase({ replyId: uuidv7(), authorId: uuidv7() }, repository),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw NOT_FOUND for an already deleted reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const authorId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, {
      authorId,
      deletedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    await expect(
      removeReplyUseCase({ replyId: reply.id, authorId }, repository),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw NOT_FOUND for a top-level comment id", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    await expect(
      removeReplyUseCase({ replyId: parent.id, authorId: parent.authorId }, repository),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw FORBIDDEN when removing someone else's reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const reply = await insertReply(snack.id, parent.id);

    await expect(
      removeReplyUseCase({ replyId: reply.id, authorId: uuidv7() }, repository),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const stored = await repository.getReplyById(reply.id);
    expect(stored?.deletedAt).toBeNull();
  });
});
