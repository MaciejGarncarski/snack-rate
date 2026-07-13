import { relations } from "@snack-rate/db-schema/relations";
import * as schema from "@snack-rate/db-schema/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

export function createDb(client: Pool) {
  return drizzle({
    client,
    schema,
    relations,
  });
}

export type Db = ReturnType<typeof createDb>;
