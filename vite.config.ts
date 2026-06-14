import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    host: true,
    allowedHosts: ["host.docker.internal"],
  },
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
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
          files: ["**/db/**", "**/observability/**", "**/server/**"],
        },
      },
    }),
    viteReact(),
  ],
});

export default config;
