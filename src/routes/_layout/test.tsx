import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_layout/test"!</div>;
}
