import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as z from "zod";

import { AppLayout } from "#/components/layout/app-layout";

const sharedParamsSchema = z.looseObject({
  page: z.number().optional(),
  filter: z.string().optional(),
  sort: z.enum(["newest", "oldest", "highestRated", "lowestRated"]).optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  validateSearch: sharedParamsSchema,
  notFoundComponent: () => <div>Nie znaleziono 1</div>,
});

function RouteComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
