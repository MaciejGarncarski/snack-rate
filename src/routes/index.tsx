import { trace } from "@opentelemetry/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Button } from "#/components/ui/button";
import { logger } from "#/observability/logger/logger";
import { client, orpc } from "#/orpc/client";

export const Route = createFileRoute("/")({ component: Home });

const sre = createServerFn().handler(() => {
  const tracer = trace.getTracer("app");
  return tracer.startActiveSpan("list-todos-handler", async (span) => {
    span.addEvent("handler started");

    try {
      span.addEvent("checking cache");

      const cached = null;

      if (cached) {
        span.addEvent("cache hit");
        return cached;
      }

      span.addEvent("cache miss - querying DB");

      if (Math.random() > 0.5) {
        logger.audit({ user: "john.doe" }, "User accessed the list of todos");
      } else {
        logger.info({ user: "john.doe" }, "User accessed the list of todos");
      }

      const todos = await client.listTodos({});

      span.addEvent("DB query complete", {
        "todo.count": todos.length,
      });

      return todos;
    } finally {
      span.addEvent("handler finished");
      span.end();
    }
  });
});

function Home() {
  const { data } = useQuery(orpc.listTodos.queryOptions({ input: {} }));

  return (
    <div className="p-8">
      <Button onClick={() => sre()} variant={"secondary"}>
        Click me
      </Button>
      {data?.map((todo) => (
        <div key={todo.id}>{todo.name}</div>
      ))}
    </div>
  );
}
