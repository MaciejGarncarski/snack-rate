import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { getSnackBySlugQueryOptions } from "#/features/snacks/services/get-snack-by-slug.query";

export const Route = createFileRoute("/_layout/snack/$slug")({
  component: RouteComponent,
  loader: ({ params, context }) => {
    context.queryClient.ensureQueryData(getSnackBySlugQueryOptions(params.slug));
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data, isError } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));

  if (isError) {
    return <div>Error loading snack</div>;
  }

  if (!data) {
    return <div>snack not found</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{data.name}</h1>
      <p className="mb-2 text-lg">{data.description}</p>
      <p className="mb-2 text-xl font-semibold">{data.price} zł</p>
      <p className="text-sm text-muted-foreground">Average rating: {data.avgRating}</p>
      <div>
        <p>tags</p>
        {data.tags.map((tag) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>
    </div>
  );
}
