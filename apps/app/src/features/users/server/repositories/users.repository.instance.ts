import { getMainDb } from "#/infrastructure/db/db";

import { createUsersRepository } from "./users.repository";

export const usersRepository = createUsersRepository({ db: getMainDb() });
