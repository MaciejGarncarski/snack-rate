import { Button } from "#/components/ui/button";
import { testCounter } from "#/lib/metrics/counters";
import { client, orpc } from "#/orpc/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({ component: Home });

const sre = createServerFn().handler(async () => {
  await testCounter.inc({
    status: "success",
    user_id: Math.floor(Math.random() * 1000).toString(),
  });
  const todos = await client.listTodos({});
  return { message: "Hello from the server!", todos };
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
