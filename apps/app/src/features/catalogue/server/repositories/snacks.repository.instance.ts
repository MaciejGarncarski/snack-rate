import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { getMainDb } from "#/infrastructure/db/db";
import { getPublicFileUrl } from "#/infrastructure/s3-client";

export const snacksRepository = createSnacksRepository({
  db: getMainDb(),
  getFileUrl: (key) => Promise.resolve(getPublicFileUrl(key)),
});
