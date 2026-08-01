import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BarcodeIcon, StarIcon, XCircleIcon } from "lucide-react";
import type z from "zod";

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
import { ensureGuestId } from "#/features/ratings/api/guest-id.server";
import { removeRatingFn } from "#/features/ratings/api/ratings.server";
import { UserRatingCard } from "#/features/ratings/components/user-rating-card";
import {
  snackRatingsQueryOptions,
  useRateSnack,
} from "#/features/ratings/queries/ratings.query-options";
import type { removeRatingSchema } from "#/schemas/ratings";

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
    const [snack, { guestId }] = await Promise.all([
      context.queryClient.ensureQueryData(getSnackBySlugQueryOptions(params.slug)),
      ensureGuestId(),
    ]);

    if (!snack) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(snackRatingsQueryOptions(snack.id, guestId));

    return { snack, guestId };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };

    const snack = loaderData.snack;
    const title = snack.name;
    const description = snack.description ?? "Sprawdź ten produkt na Snack Rate!";
    const image = `/produkt/${snack.slug}/og.png`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Snack Rate" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: title },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: title },
        { name: "twitter:site", content: "@mgarncarski" },
        { name: "twitter:creator", content: "@mgarncarski" },
      ],
    };
  },
});

function RouteComponent() {
  const { guestId } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));
  const ratings = useSuspenseQuery(snackRatingsQueryOptions(data.id, guestId)).data;
  const rateSnack = useRateSnack();

  const removeRating = useMutation({
    mutationFn: (mutationData: z.input<typeof removeRatingSchema>) => {
      return removeRatingFn({ data: mutationData });
    },
    onSuccess: async (_, __, ___, { client }) => {
      await Promise.all([
        client.invalidateQueries(snackRatingsQueryOptions(data.id, guestId)),
        client.invalidateQueries(getSnackBySlugQueryOptions(slug)),
      ]);
    },
  });

  const imageUrls = data.images.filter((img) => img.type === "default").map((img) => img.url);

  const handleRate = async (rating: number) => {
    await rateSnack.mutateAsync({
      snackItemId: data.id,
      rating,
      guestId,
    });
  };

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
              <SnackRating
                rating={ratings?.avgRating ?? data.avgRating}
                ratingCount={ratings?.ratingCount}
                withText
                size="lg"
              />
            </div>
          </div>

          <Card className="gap-0 rounded-2xl border border-border/70 py-0 shadow-sm">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">Twoja ocena</h2>
        <UserRatingCard
          isPending={rateSnack.isPending}
          userRating={ratings?.userRating ?? null}
          onRate={handleRate}
          onRemove={() => removeRating.mutate({ snackItemId: data.id, guestId })}
        />
      </section>
    </main>
  );
}
