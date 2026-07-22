import { useSuspenseQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";

import SnackImageSlider from "#/components/snacks/snack-image-slider";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Badge } from "#/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query";

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
  loader: async ({
    params,
    context,
  }: {
    params: { slug: string };
    context: { queryClient: QueryClient };
  }) => {
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

  const imageUrls = data.images.filter((img) => img.type === "default").map((img) => img.url);

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex gap-30">
        <div className="w-[20rem]">
          <SnackImageSlider images={imageUrls} />
        </div>
        <div>
          <h1 className="mb-4 text-3xl font-bold">{data.name}</h1>
          <p className="mb-2 text-lg text-muted-foreground">{data.description || "Brak opisu"}</p>
          <SnackRating rating={data.avgRating} />
          <div>{<Badge>{data.type.name}</Badge>}</div>
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-2xl font-bold">Oceny</h2>
        dodac fetcha
      </div>
    </div>
  );
}
