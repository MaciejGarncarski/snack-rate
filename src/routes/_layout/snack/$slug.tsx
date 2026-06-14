import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getSnackBySlugQueryOptions } from "#/features/snacks/services/get-snack-by-slug.query";

export const Route = createFileRoute("/_layout/snack/$slug")({
  component: RouteComponent,
  loader: ({ params, context }) => {
    context.queryClient.ensureQueryData(getSnackBySlugQueryOptions(params.slug));
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));

  if (!data) {
    return <div>snack not found</div>;
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
