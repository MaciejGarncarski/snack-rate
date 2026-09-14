import { getMainDb } from "#/infrastructure/db/db";
import { getPublicFileUrl } from "#/infrastructure/s3-client";

import { createAdminRepository } from "./admin.repository";

export const adminRepository = createAdminRepository({
  db: getMainDb(),
  getFileUrl: (key) => Promise.resolve(getPublicFileUrl(key)),
});
