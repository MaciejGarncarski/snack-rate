import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { createDb } from "#/infrastructure/db/db";
import { getPool } from "#/infrastructure/db/pool";

export const commentsRepository = createCommentsRepository({
  db: createDb(getPool()),
});
