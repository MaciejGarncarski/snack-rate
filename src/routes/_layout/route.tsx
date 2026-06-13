import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Navbar } from "#/components/layout/navbar";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="">
      <Navbar />
      <div className="mx-auto min-h-[calc(100dvh-2rem)] max-w-7xl p-8">
        <Outlet />
      </div>
    </div>
  );
}
