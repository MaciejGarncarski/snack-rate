// oxlint-disable no-console
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Pool } from "pg";
import type { TestProject } from "vitest/node";

import { createDb } from "#/infrastructure/db/db";

let pgContainer: StartedPostgreSqlContainer | undefined;
const TEMPLATE_DB_NAME = "snackrate_it_template";

export async function setup(project: TestProject) {
  pgContainer = await new PostgreSqlContainer("postgres:19-alpine").start();
  console.log("##### postgres started #####");

  const pgConfig = {
    host: "localhost",
    port: pgContainer.getPort(),
    username: pgContainer.getUsername(),
    password: pgContainer.getPassword(),
  };

  project.provide("pgConfig", pgConfig);

  const adminPool = new Pool({
    host: pgConfig.host,
    port: pgConfig.port,
    user: pgConfig.username,
    password: pgConfig.password,
    database: "postgres",
  });

  await adminPool.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB_NAME}" WITH (FORCE)`);
  await adminPool.query(`CREATE DATABASE "${TEMPLATE_DB_NAME}"`);
  await adminPool.end();

  const templatePool = new Pool({
    host: pgConfig.host,
    port: pgConfig.port,
    user: pgConfig.username,
    password: pgConfig.password,
    database: TEMPLATE_DB_NAME,
  });

  const templateDb = createDb(templatePool);
  await migrate(templateDb, { migrationsFolder: "../../packages/db-schema/drizzle" });
  await templatePool.end();

  project.provide("templateDbName", TEMPLATE_DB_NAME);
  console.log("##### template db migrated #####");
}

export async function teardown() {
  if (pgContainer) {
    try {
      const pgConfig = {
        host: "localhost",
        port: pgContainer.getPort(),
        username: pgContainer.getUsername(),
        password: pgContainer.getPassword(),
      };
      const adminPool = new Pool({
        host: pgConfig.host,
        port: pgConfig.port,
        user: pgConfig.username,
        password: pgConfig.password,
        database: "postgres",
      });
      await adminPool.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB_NAME}" WITH (FORCE)`);
      await adminPool.end();
    } catch {
      // best effort cleanup
    }
  }
  await pgContainer?.stop();
  console.log("##### postgres stopped #####");
}

declare module "vitest" {
  export interface ProvidedContext {
    pgConfig: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
    templateDbName: string;
  }
}
