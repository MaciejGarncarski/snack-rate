import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
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
        test: {
          name: "integration",
          testTimeout: 30_000,
          setupFiles: ["./src/tests/mocks.ts", "./src/tests/setup.int.ts"],
          globalSetup: "./src/tests/global-setup.int.ts",
          include: ["**/*.int.test.ts"],
          exclude: [...configDefaults.exclude, "**/e2e/**"],
        },
      },
      {
        test: {
          name: "unit",
          setupFiles: ["./src/tests/mocks.ts"],
          include: ["**/*.unit.test.ts"],
          exclude: [...configDefaults.exclude, "**/e2e/**"],
        },
      },
    ],
  },
});
