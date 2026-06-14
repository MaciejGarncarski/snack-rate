import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getProductBySlugQueryOptions } from "#/features/products/services/get-product-by-slug.query";

export const Route = createFileRoute("/_layout/product/$slug")({
  component: RouteComponent,
  loader: ({ params, context }) => {
    context.queryClient.ensureQueryData(getProductBySlugQueryOptions(params.slug));
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(getProductBySlugQueryOptions(slug));

  if (!data) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{data.name}</h1>
      <p className="mb-2 text-lg">{data.description}</p>
      <p className="mb-2 text-xl font-semibold">{data.price} zł</p>
      <p className="text-sm text-muted-foreground">Average rating: {data.avgRating}</p>
    </div>
  );
}
