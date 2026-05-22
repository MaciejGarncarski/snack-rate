import { instrumentDrizzleClient } from "@kubiks/otel-drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { serverEnv } from "#/env/server.env.ts";

import * as schema from "./schema.ts";

const url = new URL(serverEnv.DATABASE_URL);

export const dbPool = new Pool({
  host: url.hostname,
  port: Number(url.port),
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
});

export const db = drizzle(dbPool, { schema });
instrumentDrizzleClient(db, {
  dbSystem: "postgresql",
  dbName: "snack-rate-db",
  captureQueryText: true,
});
