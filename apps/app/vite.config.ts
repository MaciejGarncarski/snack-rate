import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { nitro } from "nitro/vite";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";

config({ path: resolve(import.meta.dirname, "../../.env.development") });

function resolveGitCommitSha(): string {
  const fromEnv = process.env.VITE_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (fromEnv?.trim()) {
    return fromEnv.trim().slice(0, 8);
  }
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim().slice(0, 8);
  } catch {
    return "unknown";
  }
}

const gitCommitSha = resolveGitCommitSha();

const viteConfig = defineConfig({
  envDir: "../..",
  resolve: { tsconfigPaths: true },
  define: {
    "import.meta.env.VITE_GIT_COMMIT_SHA": JSON.stringify(gitCommitSha),
  },
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
