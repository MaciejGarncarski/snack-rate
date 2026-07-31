import { relations } from "@snack-rate/db-schema/relations";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

import { getPool } from "#/infrastructure/db/pool";

export function createDb(client: Pool) {
  return drizzle({
    client,
    relations,
    jit: true,
  });
}

export type Db = ReturnType<typeof createDb>;
export type DbTransaction = Parameters<Parameters<Db["transaction"]>[0]>[0];

let mainDb: Db | undefined;

export function getMainDb(): Db {
  mainDb ??= createDb(getPool());
  return mainDb;
}
