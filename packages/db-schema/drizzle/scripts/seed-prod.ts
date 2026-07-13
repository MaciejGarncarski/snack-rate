import { hashPassword } from "@snack-rate/db-schema/crypto";
import * as schema from "@snack-rate/db-schema/schema";
// oxlint-disable no-console
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

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

  // Demo user
  const demoEmail = "demo@snackrate.pl";
  const [existingUser] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, demoEmail))
    .limit(1);

  if (!existingUser) {
    const passwordHash = await hashPassword("Demo1234!");

    await db.insert(schema.users).values({
      email: demoEmail,
      passwordHash,
      firstName: "Demo",
      lastName: "User",
      role: "admin",
      status: "active",
      emailVerifiedAt: new Date(),
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

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
