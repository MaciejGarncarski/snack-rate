import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema.ts";
import { env } from "#/env/env.ts";

export const db = drizzle(env.server.DATABASE_URL, { schema });
