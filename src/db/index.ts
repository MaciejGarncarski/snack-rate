import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "#/env/env.ts";

import * as schema from "./schema.ts";

export const dbPool = new Pool({ connectionString: env.server.DATABASE_URL });

export const db = drizzle(dbPool, { schema });
