import { createRatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { createDb } from "#/infrastructure/db/db";
import { getPool } from "#/infrastructure/db/pool";

export const ratingsRepository = createRatingsRepository({
  db: createDb(getPool()),
});
