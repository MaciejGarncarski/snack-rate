import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { reset } from "drizzle-seed";
import { Pool } from "pg";
import { inject } from "vitest";

import type { Db } from "#/infrastructure/db/db";
import { relations } from "#/infrastructure/db/relations";
import * as schema from "#/infrastructure/db/schema.ts";

let db: Db;

beforeAll(async () => {
  const dbConfig = inject("pgConfig");
  const dbName = `test_db_${crypto.randomUUID().replaceAll("-", "_")}`;

  const dbPool = new Pool({
    host: "localhost",
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbName,
  });

  db = drizzle({ relations: relations, client: dbPool });
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
});

beforeEach(async () => {
  await reset(db, schema);
});
