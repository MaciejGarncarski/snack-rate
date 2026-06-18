import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { createDb } from "#/infrastructure/db/db";
import { getPool } from "#/infrastructure/db/pool";
import { getPrivateFileUrl } from "#/infrastructure/s3-client";

export const snacksRepository = createSnacksRepository({
  db: createDb(getPool()),
  getFileUrl: getPrivateFileUrl,
});
