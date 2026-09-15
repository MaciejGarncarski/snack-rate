import { getMainDb } from "#/infrastructure/db/db";
import { deletePublicFile, getPublicFileUrl } from "#/infrastructure/s3-client";

import { createAdminSnacksRepository } from "./admin-snacks.repository";
import { createAdminRepository } from "./admin.repository";

const db = getMainDb();
const getFileUrl = (key: string) => Promise.resolve(getPublicFileUrl(key));

export const adminRepository = {
  ...createAdminRepository({ db, getFileUrl }),
  ...createAdminSnacksRepository({ db, getFileUrl, deleteFile: (key) => deletePublicFile(key) }),
};
