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

export type Database = ReturnType<typeof createDb>;
export type DbTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let mainDb: Database | undefined;

export function getMainDb(): Database {
  mainDb ??= createDb(getPool());
  return mainDb;
}
