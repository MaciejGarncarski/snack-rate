import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";

import * as schema from "../../src/db/schema.ts";

const db = drizzle(process.env.DATABASE_URL!);

export async function seedDatabase() {
  await seed(db, schema, { count: 50 }).refine((funcs) => {
    return {
      todos: {
        count: 50,
        columns: {
          createdAt: funcs.date(),
          title: funcs.line(),
          completed: funcs.boolean(),
        },
      },
    };
  });

  console.log("Seed completed successfully");
}

try {
  await seedDatabase();
  process.exit(0);
} catch (e) {
  console.error("Error seeding database", e as Error);
  process.exit(1);
}
