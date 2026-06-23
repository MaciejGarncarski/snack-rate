import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";

import { SnackRating } from "#/components/snacks/snack-rating";
import { Badge } from "#/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/services/get-snack-by-slug.query";

export const Route = createFileRoute("/_layout/produkt/$slug")({
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
    const snack = await context.queryClient.ensureQueryData(
      getSnackBySlugQueryOptions(params.slug),
    );

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
      <div className="mb-4 flex items-center justify-between">
        <img src={data.images[0].url} alt={data.name} className="mr-4 h-32 w-32 object-cover" />
        <div>
          <h1 className="mb-4 text-3xl font-bold">{data.name}</h1>
          <p className="mb-2 text-lg">{data.description}</p>
          <p className="mb-2 text-xl font-semibold">{data.price} zł</p>
          <SnackRating rating={data.avgRating} />
        </div>
      </div>
      <div>{data.type && <Badge>{data.type.name}</Badge>}</div>
      <div>
        <h2 className="mb-2 text-2xl font-bold">Oceny</h2>
        dodac fetcha
      </div>
    </div>
  );
}
