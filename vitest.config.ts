import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: [
        "src/features/catalogue/server/**",
        "src/features/catalogue/utils/**",
        "src/features/shared/value-objects/**",
        "src/infrastructure/**",
        "src/lib/**",
        "src/middlewares/**",
        "src/observability/**",
        "src/orpc/**",
        "src/server.ts",
        "src/start.ts",
      ],
      reporter: ["text", "lcov", "html"],
    },
    setupFiles: ["./src/tests/mocks.ts", "./src/tests/setup.ts"],
    globalSetup: "./src/tests/global-setup.ts",
    exclude: [...configDefaults.exclude, "**/e2e/**"],
  },
});
