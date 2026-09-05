import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { nitro } from "nitro/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

config({ path: resolve(import.meta.dirname, "../../.env.development") });

const viteConfig = defineConfig({
  envDir: "../..",
  resolve: { tsconfigPaths: true },
  server: {
    host: true,
    allowedHosts: ["host.docker.internal"],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        server: {
          files: ["**/tests/**"],
        },
        client: {
          specifiers: [
            /^@opentelemetry\//u,
            /^drizzle-orm(?:\/|$)/u,
            /^drizzle-kit(?:\/|$)/u,
            /^pino(?:\/|$)/u,
            /^pg(?:\/|$)/u,
            /^nitro(?:\/|$)/u,
          ],
          excludeFiles: ["**/node_modules/**", "**/orpc/**", "**/*.api.ts"],
          files: ["**/tests/**", "**/db/**", "**/observability/**", "**/server/**"],
        },
      },
    }),
    nitro({
      plugins: ["./server/plugins/opentelemetry.ts"],
    }),
    viteReact({ compiler: true }),
  ],
});

export default viteConfig;
