import { os } from "@orpc/server";

import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { listSnackCommentsUseCase } from "#/features/comments/server/use-cases/list-snack-comments.use-case";
import { listCommentsSchema } from "#/schemas/comments";

export const listCommentsProcedure = os.input(listCommentsSchema).handler(({ input }) => {
  return listSnackCommentsUseCase(
    {
      snackItemId: input.snackItemId,
      limit: input.limit,
      cursor: input.cursor,
    },
    commentsRepository,
  );
});
