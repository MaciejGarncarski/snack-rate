import { decodeCursor, slicePage } from "#/lib/cursor";

import type { CommentsRepository } from "../repositories/comments.repository";

type ListSnackCommentsInput = {
  snackItemId: string;
  limit: number;
  cursor?: string | null;
  userId?: string | null;
};

export async function listSnackCommentsUseCase(
  input: ListSnackCommentsInput,
  repository: CommentsRepository,
) {
  const decodedCursor = input.cursor ? decodeCursor(input.cursor) : null;

  const pageItems = await repository.listCommentsForSnack({
    snackItemId: input.snackItemId,
    limit: input.limit + 1,
    cursor: decodedCursor,
    userId: input.userId ?? null,
  });

  return slicePage(pageItems, input.limit);
}
