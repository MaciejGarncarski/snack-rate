import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BarcodeIcon, XCircleIcon } from "lucide-react";
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
import { UserRatingDialog } from "#/features/ratings/components/user-rating-dialog";
import {
  snackRatingsQueryOptions,
  useRateSnack,
} from "#/features/ratings/queries/ratings.query-options";
import { ensureGuestId } from "#/features/ratings/transport/guest-id.server";
import { removeRatingFn } from "#/features/ratings/transport/ratings.server";
import { cn } from "#/lib/utils";
import type { removeRatingSchema } from "#/schemas/ratings";

const SMALL_DESCRIPTION_LENGTH = 100;
const NORMAL_DESCRIPTION_LENGTH = 350;

export const Route = createFileRoute("/_app/produkt/$slug")({
  component: RouteComponent,
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

  const handleRate = async (rating: number, body: string | null) => {
    await rateSnack.mutateAsync({
      snackItemId: data.id,
      rating,
      body,
      guestId,
    });
  };

  const isLongDescription = data.description && data.description.length > NORMAL_DESCRIPTION_LENGTH;
  const isNormalDescription =
    data.description &&
    data.description.length <= NORMAL_DESCRIPTION_LENGTH &&
    data.description.length > SMALL_DESCRIPTION_LENGTH;
  const isShortDescription =
    data.description && data.description.length <= SMALL_DESCRIPTION_LENGTH;

  return (
    <main className="mx-auto w-full max-w-6xl pb-10 flex flex-col gap-10">
      <div className="flex gap-8 flex-col lg:flex-row lg:gap-20">
        <div className="mx-auto w-full max-w-sm lg:sticky lg:top-8">
          <SnackImageSlider images={imageUrls} slug={slug} />
        </div>

        <div className="pt-1 flex flex-col gap-6 lg:pt-2 flex-1">
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {data.name}
            </h1>
            <Badge variant="default" className="rounded-full px-3 py-1 font-semibold">
              {data.type.name}
            </Badge>
            <p
              className={cn(
                "max-w-xl text-pretty leading-relaxed text-muted-foreground line-clamp-16",
                isLongDescription && "sm:text-base",
                isNormalDescription && "sm:text-lg",
                isShortDescription && "sm:text-xl",
              )}
            >
              {data.description || "Ten produkt nie ma jeszcze opisu."}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-3 border-y border-border/70 py-5">
            <div>
              <p className="text-xs pb-2 font-bold tracking-[0.12em] text-muted-foreground uppercase">
                Średnia ocena
              </p>
              <SnackRating
                rating={ratings?.avgRating ?? data.avgRating}
                ratingCount={ratings?.ratingCount}
                withText
                size="md"
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

      <section className="flex flex-col gap-3 pt-6 lg:w-2xl lg:mx-auto">
        <h2 className="text-xl font-bold tracking-tight">Twoja ocena</h2>
        <UserRatingDialog
          isPending={rateSnack.isPending}
          userRating={ratings?.userRating ?? null}
          userBody={ratings?.userBody ?? null}
          onRate={handleRate}
          onRemove={() => removeRating.mutate({ snackItemId: data.id, guestId })}
        />
      </section>
    </main>
  );
}
