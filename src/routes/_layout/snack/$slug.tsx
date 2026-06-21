import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/services/get-snack-by-slug.query";

export const Route = createFileRoute("/_layout/snack/$slug")({
  component: RouteComponent,
  notFoundComponent: () => {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Nie znaleziono produktu</EmptyTitle>
          <EmptyDescription>Ups, wygląda na to, że ten produkt nie istnieje.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  },
  loader: async ({ params, context }) => {
    const snack = await context.queryClient.ensureQueryData(getSnackBySlugQueryOptions(params.slug));

    if (!snack) {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));

  if (!data) {
    return null;
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{data.name}</h1>
      <p className="mb-2 text-lg">{data.description}</p>
      <p className="mb-2 text-xl font-semibold">{data.price} zł</p>
      <p className="text-sm text-muted-foreground">Average rating: {data.avgRating}</p>
      <div>{data.type && <Badge>{data.type.name}</Badge>}</div>
    </div>
  );
}
