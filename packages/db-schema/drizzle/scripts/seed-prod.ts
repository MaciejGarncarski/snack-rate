import * as schema from "@snack-rate/db-schema/schema";
// oxlint-disable no-console
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Running prod seed...");

  // Snack types
  await db
    .insert(schema.snackTypes)
    .values([
      { name: "Napój", slug: "napoj" },
      { name: "Chipsy", slug: "chipsy" },
      { name: "Energetyk", slug: "energetyk" },
      { name: "Słodycze", slug: "slodycze" },
      { name: "Czekolada", slug: "czekolada" },
    ])
    .onConflictDoNothing({ target: schema.snackTypes.slug });

  console.log("  ✓ snack types");

  // Demo user (Better Auth `user` table)
  const demoEmail = "demo@snackrate.pl";
  const [existingUser] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, demoEmail))
    .limit(1);

  if (!existingUser) {
    await db.insert(schema.user).values({
      id: randomUUID(),
      email: demoEmail,
      name: "Demo",
      username: "Demo",
      role: "admin",
      status: "active",
      emailVerified: true,
    });

    console.log("  ✓ demo user");
  }

  console.log("Prod seed completed successfully");
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error("Error seeding database", e as Error);
  process.exit(1);
}

// oxlint-disable-next-line unicorn/require-module-specifiers typescript/no-useless-empty-export
export {};
