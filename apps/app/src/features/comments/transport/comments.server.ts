import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { listSnackCommentsUseCase } from "#/features/comments/server/use-cases/list-snack-comments.use-case";
import { baseProcedure } from "#/lib/orpc/procedure";
import { listCommentsSchema } from "#/schemas/comments";

export const listCommentsProcedure = baseProcedure
  .input(listCommentsSchema)
  .handler(({ input }) => {
    return listSnackCommentsUseCase(
      {
        snackItemId: input.snackItemId,
        limit: input.limit,
        cursor: input.cursor,
      },
      commentsRepository,
    );
  });
