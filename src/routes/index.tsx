import { Button } from "#/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({ component: Home });

const sre = createServerFn().handler(() => {
  return { message: "Hello from the server!" };
});

function Home() {
  return (
    <div className="p-8">
      <Button onClick={() => sre()} variant={"secondary"}>
        Click me
      </Button>
    </div>
  );
}
