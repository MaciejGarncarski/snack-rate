import { getMainDb } from "#/infrastructure/db/db";

import { createAdminRepository } from "./admin.repository";

export const adminRepository = createAdminRepository({ db: getMainDb() });
