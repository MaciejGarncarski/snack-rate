import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Button } from "#/components/ui/button";
import { client, orpc } from "#/orpc/client";

export const Route = createFileRoute("/")({ component: Home });

const sre = createServerFn().handler(async () => {
  await client.listTodos({});

  return { message: "Hello from the server!" };
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
