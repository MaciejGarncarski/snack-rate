import { migrate } from "drizzle-orm/postgres-js/migrator";
import { reset } from "drizzle-seed";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import { inject } from "vitest";

import { createDb, type Db } from "#/infrastructure/db/db";
import * as schema from "#/infrastructure/db/schema.ts";

let db: Db;
let dbPool: Pool;

export function getDb(): Db {
  return db;
}

beforeAll(async () => {
  const dbConfig = inject("pgConfig");
  const dbName = `test_db_${nanoid()}`;

  const adminPool = new Pool({
    host: "localhost",
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: "postgres",
  });

  await adminPool.query(`CREATE DATABASE "${dbName}"`);
  await adminPool.end();

  dbPool = new Pool({
    host: "localhost",
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbName,
  });

  db = createDb(dbPool);
  await migrate(db, { migrationsFolder: "./drizzle" });
});

beforeEach(async () => {
  await reset(db, schema);
});
