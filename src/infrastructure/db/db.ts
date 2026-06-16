import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { serverEnv } from "#/lib/server.env.ts";

import { relations } from "./relations.ts";

const url = new URL(serverEnv.DATABASE_URL);

export const dbPool = new Pool({
  host: url.hostname,
  port: Number(url.port),
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
});

export const db = drizzle({ relations, client: dbPool });
export type Db = typeof db;
