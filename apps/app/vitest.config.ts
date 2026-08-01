import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      include: [
        "src/features/catalogue/server/**",
        "src/features/catalogue/transport/**",
        "src/features/catalogue/queries/**",
        "src/features/catalogue/reviews/transport/**",
        "src/features/catalogue/utils/**",
        "src/features/catalogue/create-snack/utils/**",
        "src/features/shared/value-objects/**",
        "src/infrastructure/**",
        "src/lib/**",
        "src/middlewares/**",
        "src/observability/**",
        "src/orpc/**",
        "src/server.ts",
        "src/start.ts",
      ],
      exclude: ["**/tests/**", "**/*.unit.test.ts", "**/*.int.test.ts", "**/*.d.ts", "**/index.ts"],
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          setupFiles: ["./src/tests/mocks.ts"],
          include: ["**/*.unit.test.ts"],
          exclude: [...configDefaults.exclude, "**/e2e/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          testTimeout: 30_000,
          setupFiles: ["./src/tests/mocks.ts", "./src/tests/setup.int.ts"],
          globalSetup: "./src/tests/global-setup.int.ts",
          include: ["**/*.int.test.ts"],
          exclude: [...configDefaults.exclude, "**/e2e/**"],
        },
      },
    ],
  },
});
