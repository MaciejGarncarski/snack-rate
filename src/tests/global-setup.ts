// oxlint-disable no-console
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

let pgContainer: StartedPostgreSqlContainer | undefined;

export async function setup(project: TestProject) {
  console.log("*** global setup -- starting postgres container");
  pgContainer = await new PostgreSqlContainer("postgres:18-alpine").start();
  console.log("*** global setup -- postgres container started");

  project.provide("pgConfig", {
    host: "localhost",
    port: pgContainer.getPort(),
    username: pgContainer.getUsername(),
    password: pgContainer.getPassword(),
  });
}

export async function teardown() {
  console.log("*** teardown -- stopping postgres container");
  await pgContainer?.stop();
  console.log("*** teardown -- container stopped");
}

declare module "vitest" {
  export interface ProvidedContext {
    pgConfig: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
  }
}
