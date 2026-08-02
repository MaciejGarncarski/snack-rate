import { useSuspenseQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";

import { SnackBarcode } from "#/components/snacks/snack-barcode";
import SnackImageSlider from "#/components/snacks/snack-image-slider";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "#/components/ui/item";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query";
import { ReviewSection } from "#/features/ratings/components/review-section";
import { snackRatingsQueryOptions } from "#/features/ratings/queries/ratings.query-options";
import { ensureGuestId } from "#/features/ratings/transport/guest-id.server";
import { cn } from "#/lib/utils";

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

  const imageUrls = data.images.filter((img) => img.type === "default").map((img) => img.url);

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

          <Card className="mt-auto [--card-spacing:--spacing(4)]">
            <CardHeader>
              <CardTitle>Informacje o produkcie</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemGroup>
                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Rodzaj</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Badge className="text-base rounded-full h-6 px-3 py-1 font-semibold">
                      {data.type.name}
                    </Badge>
                  </ItemActions>
                </Item>
                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Średnia ocena</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <SnackRating rating={ratings?.avgRating ?? data.avgRating} withText size="md" />
                  </ItemActions>
                </Item>

                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Kod kreskowy</ItemTitle>
                    <ItemDescription>Pomaga w wyszukiwaniu produktu.</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SnackBarcode barcode={data.barcode} size="sm" variant="default" />
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewSection
        snackId={data.id}
        guestId={guestId}
        slug={slug}
        ratingsCount={ratings.ratingCount ?? null}
        userRating={ratings?.userRating ?? null}
        userBody={ratings?.userBody ?? null}
      />
    </main>
  );
}
