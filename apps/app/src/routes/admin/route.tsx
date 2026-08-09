import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <div>Admin panel</div>;
}
