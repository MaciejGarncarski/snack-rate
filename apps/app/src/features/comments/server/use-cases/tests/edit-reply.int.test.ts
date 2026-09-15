import { snackComments } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { editReplyUseCase } from "#/features/comments/server/use-cases/edit-reply.use-case";
import { listCommentRepliesUseCase } from "#/features/comments/server/use-cases/list-comment-replies.use-case";
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

describe("edit reply", () => {
  it("should update the body of an own reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const authorId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId, body: "Stara treść" });

    const updated = await editReplyUseCase(
      { replyId: reply.id, body: "  Nowa treść  ", authorId },
      repository,
    );

    expect(updated?.body).toBe("Nowa treść");

    const listed = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);
    expect(listed.items.map((item) => item.id)).toEqual([reply.id]);
    expect(listed.items[0].body).toBe("Nowa treść");
    expect(listed.items[0].isEdited).toBe(true);
  });

  it("should throw NOT_FOUND for a missing reply", async () => {
    await expect(
      editReplyUseCase({ replyId: uuidv7(), body: "Nowa treść", authorId: uuidv7() }, repository),
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
      editReplyUseCase({ replyId: reply.id, body: "Nowa treść", authorId }, repository),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw NOT_FOUND for a top-level comment id", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    await expect(
      editReplyUseCase(
        { replyId: parent.id, body: "Nowa treść", authorId: parent.authorId },
        repository,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("should throw FORBIDDEN when editing someone else's reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const reply = await insertReply(snack.id, parent.id, { body: "Cudza odpowiedź" });

    await expect(
      editReplyUseCase({ replyId: reply.id, body: "Podmiana", authorId: uuidv7() }, repository),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const stored = await repository.getReplyById(reply.id);
    expect(stored?.body).toBe("Cudza odpowiedź");
  });

  it("should throw BAD_REQUEST for a blank body", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const authorId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId });

    await expect(
      editReplyUseCase({ replyId: reply.id, body: "   ", authorId }, repository),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
