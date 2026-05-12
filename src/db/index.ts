import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "#/env/env.ts";
import * as schema from "./schema.ts";

console.log(env.server);

export const db = drizzle(env.server.DATABASE_URL, { schema });
