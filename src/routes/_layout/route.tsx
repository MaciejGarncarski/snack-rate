import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Navbar } from "#/components/layout/navbar";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <Navbar />
      <Outlet />
    </div>
  );
}
