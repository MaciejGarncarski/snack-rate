import { createFileRoute } from "@tanstack/react-router";

import { ProductsList } from "#/features/products/components/products-list";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ProductsList />
    </div>
  );
}
