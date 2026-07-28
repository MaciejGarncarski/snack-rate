import { useSuspenseQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BarcodeIcon, StarIcon, XCircleIcon } from "lucide-react";

import { SnackBarcode } from "#/components/snacks/snack-barcode";
import SnackImageSlider from "#/components/snacks/snack-image-slider";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query";

export const Route = createFileRoute("/_app/produkt/$slug")({
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

    return snack;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };

    return {
      meta: [
        { property: "og:image", content: `/produkt/${loaderData.slug}/og.png` },
        { property: "og:title", content: loaderData.name },
        {
          property: "og:description",
          content: loaderData.description ?? "Sprawdź ten produkt na Snack Rate!",
        },
        { property: "og:site_name", content: "Snack Rate" },
        { property: "og:type", content: "website" },
      ],
    };
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
    <main className="mx-auto w-full max-w-4xl pb-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-12">
        <div className="mx-auto w-full max-w-sm lg:sticky lg:top-8">
          <SnackImageSlider images={imageUrls} slug={slug} />
        </div>

        <div className="pt-1 flex flex-col gap-6 lg:pt-2">
          <Badge variant="default" className="mb-4 rounded-full px-3 py-1 font-semibold">
            {data.type.name}
          </Badge>
          <div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {data.name}
            </h1>
            <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              {data.description || "Ten produkt nie ma jeszcze opisu."}
            </p>
          </div>

          <div className=" flex items-center gap-3 border-y border-border/70 py-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400">
              <StarIcon className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                Średnia ocena
              </p>
              <SnackRating rating={data.avgRating} withText size="lg" />
            </div>
          </div>

          <Card className="mt-7 gap-0 rounded-2xl border border-border/70 py-0 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <BarcodeIcon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Kod kreskowy</p>
                  <p className="text-sm text-muted-foreground">
                    {data.barcode
                      ? "Zeskanuj, aby rozpoznać wariant."
                      : "Nie dodano kodu kreskowego."}
                  </p>
                </div>
              </div>
              <SnackBarcode barcode={data.barcode} size="sm" variant="default" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
