import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

import { relations } from "./relations.ts";
import * as schema from "./schema.ts";

export function createDb(client: Pool) {
  return drizzle({
    client,
    schema,
    relations,
  });
}

export type Db = ReturnType<typeof createDb>;
