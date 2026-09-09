import { ORPCError } from "@orpc/client";

import type { ReactionType } from "#/features/comments/consts/reaction-type.const";
import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { ReactionTypeVo } from "#/features/comments/value-objects/reaction-type.vo";

type ReactToCommentInput = {
  commentId: string;
  type: string;
  userId: string | null;
};

export async function reactToCommentUseCase(
  input: ReactToCommentInput,
  repository: CommentsRepository,
) {
  if (!input.userId) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Musisz się zalogować, aby reagować na komentarze.",
    });
  }

  let reactionVo: ReactionTypeVo;
  try {
    reactionVo = ReactionTypeVo.create(input.type);
  } catch {
    throw new ORPCError("BAD_REQUEST", { message: "Nieprawidłowy typ reakcji." });
  }

  try {
    const result = await repository.toggleReaction({
      commentId: input.commentId,
      userId: input.userId,
      type: reactionVo.getValue(),
    });

    return {
      commentId: input.commentId,
      userReaction: result.userReaction,
      counts: result.counts,
    };
  } catch (cause) {
    if (cause instanceof ORPCError) throw cause;
    if (cause instanceof Error && cause.message === "Comment not found") {
      throw new ORPCError("NOT_FOUND", { message: "Komentarz nie został znaleziony." });
    }
    throw cause;
  }
}

export type ReactToCommentResult = Awaited<ReturnType<typeof reactToCommentUseCase>>;

export async function removeReactionUseCase(
  input: { commentId: string; userId: string | null },
  repository: CommentsRepository,
) {
  if (!input.userId) {
    throw new ORPCError("UNAUTHORIZED", { message: "Musisz się zalogować, aby usunąć reakcję." });
  }

  await repository.removeReaction({ commentId: input.commentId, userId: input.userId });

  const counts = await repository.getReactionCounts(input.commentId);

  return {
    commentId: input.commentId,
    userReaction: null as ReactionType | null,
    counts,
  };
}
