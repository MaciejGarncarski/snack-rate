import * as schema from "@snack-rate/db-schema/schema";
import { reset } from "drizzle-seed";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import { inject } from "vitest";

import { createDb, type Database } from "#/infrastructure/db/db";

let db: Database;
let dbPool: Pool | undefined;
let currentDbName: string | undefined;

export function getDb(): Database {
  return db;
}

beforeAll(async () => {
  const dbConfig = inject("pgConfig");
  const templateDbName = inject("templateDbName");
  const dbName = `test_db_${nanoid()}`;
  currentDbName = dbName;

  const adminPool = new Pool({
    host: "localhost",
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: "postgres",
  });

  await adminPool.query(`CREATE DATABASE "${dbName}" TEMPLATE "${templateDbName}"`);
  await adminPool.end();

  dbPool = new Pool({
    host: "localhost",
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbName,
  });

  db = createDb(dbPool);
});

afterAll(async () => {
  await dbPool?.end();
  dbPool = undefined;

  if (currentDbName) {
    const dbConfig = inject("pgConfig");
    const adminPool = new Pool({
      host: "localhost",
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: "postgres",
    });
    try {
      await adminPool.query(`DROP DATABASE IF EXISTS "${currentDbName}" WITH (FORCE)`);
    } finally {
      await adminPool.end();
    }
    currentDbName = undefined;
  }
});

beforeEach(async () => {
  await reset(db, schema);
});
