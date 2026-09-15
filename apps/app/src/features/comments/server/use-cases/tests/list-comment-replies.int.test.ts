import { snackComments } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { listCommentRepliesUseCase } from "#/features/comments/server/use-cases/list-comment-replies.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack, createUser } from "#/tests/fixtures";
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

describe("list comment replies", () => {
  it("should return empty items when the comment has no replies", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });

  it("should return only replies of the requested comment", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const otherParent = await insertParentComment(snack.id);

    const first = await insertReply(snack.id, parent.id, { body: "Pierwsza" });
    const second = await insertReply(snack.id, parent.id, { body: "Druga" });
    await insertReply(snack.id, otherParent.id, { body: "Obca" });

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    expect(result.items.map((reply) => reply.id).toSorted()).toEqual(
      [first.id, second.id].toSorted(),
    );
  });

  it("should order replies newest first", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    const older = await insertReply(snack.id, parent.id, {
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const newer = await insertReply(snack.id, parent.id, {
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    expect(result.items.map((reply) => reply.id)).toEqual([newer.id, older.id]);
  });

  it("should resolve author names for users and guests", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const user = await createUser({ name: "Anna" });

    await insertReply(snack.id, parent.id, {
      authorId: user.id,
      authorType: "user",
      body: "Od użytkownika",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    await insertReply(snack.id, parent.id, {
      authorId: uuidv7(),
      authorType: "guest",
      body: "Od gościa",
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    const byBody = new Map(result.items.map((reply) => [reply.body, reply]));
    expect(byBody.get("Od użytkownika")?.authorName).toBe("Anna");
    expect(byBody.get("Od gościa")?.authorName).toBe("Gość");
  });

  it("should mark replies authored by the requesting user", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const userId = uuidv7();

    const mine = await insertReply(snack.id, parent.id, { authorId: userId });
    const foreign = await insertReply(snack.id, parent.id, { authorId: uuidv7() });

    const result = await listCommentRepliesUseCase(
      { commentId: parent.id, limit: 10, userId },
      repository,
    );

    const byId = new Map(result.items.map((reply) => [reply.id, reply]));
    expect(byId.get(mine.id)?.isUserAuthor).toBe(true);
    expect(byId.get(foreign.id)?.isUserAuthor).toBe(false);
  });

  it("should mark a reply as edited when updatedAt is later than createdAt", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const createdAt = new Date("2026-01-01T10:00:00.000Z");

    const untouched = await insertReply(snack.id, parent.id, {
      createdAt,
      updatedAt: createdAt,
    });
    const edited = await insertReply(snack.id, parent.id, {
      createdAt,
      updatedAt: new Date("2026-01-02T10:00:00.000Z"),
    });

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    const byId = new Map(result.items.map((reply) => [reply.id, reply]));
    expect(byId.get(edited.id)?.isEdited).toBe(true);
    expect(byId.get(untouched.id)?.isEdited).toBe(false);
  });

  it("should exclude soft-deleted replies", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    const visible = await insertReply(snack.id, parent.id, { body: "Widoczna" });
    await insertReply(snack.id, parent.id, {
      body: "Usunięta",
      deletedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    expect(result.items.map((reply) => reply.id)).toEqual([visible.id]);
  });

  it("should paginate replies with cursor without duplicates", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    const replies = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        insertReply(snack.id, parent.id, {
          body: `Odpowiedź ${index}`,
          createdAt: new Date(2026, 0, 1 + index, 12, 0, 0),
        }),
      ),
    );

    const page1 = await listCommentRepliesUseCase({ commentId: parent.id, limit: 2 }, repository);
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await listCommentRepliesUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { commentId: parent.id, limit: 2, cursor: page1.nextCursor ?? undefined },
      repository,
    );
    expect(page2.items).toHaveLength(2);
    expect(page2.nextCursor).not.toBeNull();

    const page3 = await listCommentRepliesUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { commentId: parent.id, limit: 2, cursor: page2.nextCursor ?? undefined },
      repository,
    );
    expect(page3.items).toHaveLength(1);
    expect(page3.nextCursor).toBeNull();

    const collected = [...page1.items, ...page2.items, ...page3.items].map((reply) => reply.id);

    expect(collected).toHaveLength(5);
    expect(new Set(collected).size).toBe(5);
    expect(new Set(collected)).toEqual(new Set(replies.map((reply) => reply.id)));
  });

  it("should return null nextCursor when all replies fit in the page", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);

    await insertReply(snack.id, parent.id);

    const result = await listCommentRepliesUseCase({ commentId: parent.id, limit: 10 }, repository);

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });
});
