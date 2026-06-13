import { drizzle } from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";

import * as schema from "../../src/server/db/schema.ts";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  await reset(db, schema);
  console.log("Reset completed successfully");
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error("Error seeding database", e as Error);
  process.exit(1);
}

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
