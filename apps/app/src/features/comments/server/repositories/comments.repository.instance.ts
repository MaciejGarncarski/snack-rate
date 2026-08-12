import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { getMainDb } from "#/infrastructure/db/db";

export const commentsRepository = createCommentsRepository({
  db: getMainDb(),
});
