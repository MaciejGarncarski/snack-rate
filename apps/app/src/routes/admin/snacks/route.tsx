import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/snacks")({
  component: () => <Outlet />,
});
