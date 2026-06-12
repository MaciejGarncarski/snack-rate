import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.development", ".env.staging", ".env.production"] });

console.log("Loaded environment variables:");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
