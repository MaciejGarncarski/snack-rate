import { vi } from "vitest";

import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { addReplyUseCase } from "#/features/comments/server/use-cases/add-reply.use-case";

const savedReply = {
  id: "reply-1",
  snackItemId: "snack-1",
  parentCommentId: "comment-1",
  body: "Zgadzam się!",
  authorId: "author-1",
  authorType: "guest",
};

function createRepositoryStub() {
  return {
    addReply: vi
      .fn<
        (data: {
          snackItemId: string;
          commentId: string;
          body: string;
          authorId: string;
          authorType: "user" | "guest";
        }) => Promise<typeof savedReply>
      >()
      .mockResolvedValue(savedReply),
  } as unknown as CommentsRepository;
}

describe("add reply", () => {
  it("should forward reply data to the repository and return the saved reply", async () => {
    const repository = createRepositoryStub();

    const result = await addReplyUseCase(
      {
        snackItemId: "snack-1",
        commentId: "comment-1",
        body: "Zgadzam się!",
        authorId: "author-1",
        authorType: "guest",
      },
      repository,
    );

    expect(repository.addReply).toHaveBeenCalledWith({
      snackItemId: "snack-1",
      authorId: "author-1",
      authorType: "guest",
      commentId: "comment-1",
      body: "Zgadzam się!",
    });
    expect(result).toEqual(savedReply);
  });

  it("should pass user author type for signed-in authors", async () => {
    const repository = createRepositoryStub();

    await addReplyUseCase(
      {
        snackItemId: "snack-1",
        commentId: "comment-1",
        body: "Dobra recenzja",
        authorId: "user-1",
        authorType: "user",
      },
      repository,
    );

    expect(repository.addReply).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: "user-1", authorType: "user" }),
    );
  });
});
