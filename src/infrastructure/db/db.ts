import { relations } from "@snack-rate/db-schema/relations";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

export function createDb(client: Pool) {
  return drizzle({
    client,
    relations,
    jit: true,
  });
}

export type Db = ReturnType<typeof createDb>;
