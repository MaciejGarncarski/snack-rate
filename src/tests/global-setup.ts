// oxlint-disable no-console
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

let pgContainer: StartedPostgreSqlContainer | undefined;

export async function setup(project: TestProject) {
  pgContainer = await new PostgreSqlContainer("postgres:18-alpine").start();
  console.log("##### postgres started #####");

  project.provide("pgConfig", {
    host: "localhost",
    port: pgContainer.getPort(),
    username: pgContainer.getUsername(),
    password: pgContainer.getPassword(),
  });
}

export async function teardown() {
  await pgContainer?.stop();
  console.log("##### postgres stopped #####");
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
