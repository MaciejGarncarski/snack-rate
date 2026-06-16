import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/features/**/server/**/*.{ts,tsx}"],
    },
    // setupFiles: ["./src/tests/setup.ts"],
    globalSetup: "./src/tests/global-setup.ts",
    exclude: [...configDefaults.exclude, "**/e2e/**"],
  },
});
