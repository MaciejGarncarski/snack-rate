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
import { Skeleton } from "#/components/ui/skeleton";
import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query-options";
import { CommentSection } from "#/features/comments/components/comment-section";
import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { formatCreatedAt } from "#/lib/date";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_app/produkt/$slug")({
  component: RouteComponent,
  loader: async ({
    params,
    context,
  }: {
    params: { slug: string };
    context: { queryClient: QueryClient };
  }) => {
    const snack = await context.queryClient.query({
      ...getSnackBySlugQueryOptions(params.slug),
      staleTime: "static",
    });

    if (!snack) {
      throw notFound();
    }

    void context.queryClient.query({
      ...snackRatingsQueryOptions(snack.id),
      staleTime: "static",
    });

    void context.queryClient.infiniteQuery({
      ...snackCommentsQueryOptions(snack.id),
      staleTime: "static",
    });

    return { snack };
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

  pendingComponent: () => {
    return (
      <main className="mx-auto w-full pb-10 flex flex-col gap-10">
        <div className="flex w-full gap-8 flex-col lg:flex-row lg:gap-15">
          <div className="mx-auto w-full max-w-md lg:sticky lg:top-8 shrink-0">
            <Card size="sm" className="w-full">
              <CardContent>
                <Skeleton className="aspect-4/5 w-full rounded-3xl" />
                <div className="mt-4 grid w-full grid-cols-3 gap-4">
                  <Skeleton className="aspect-4/5 w-full rounded-lg" />
                  <Skeleton className="aspect-4/5 w-full rounded-lg" />
                  <Skeleton className="aspect-4/5 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-1 flex w-full grow shrink flex-col gap-10">
            <Card className="w-full grow [--card-spacing:--spacing(4)]">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 md:h-9" />
              </CardHeader>
              <CardContent className="h-full w-full">
                <div className="flex w-full items-center rounded-2xl border border-transparent bg-muted/50 px-4 py-3.5">
                  <div className="flex w-full flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-auto w-full [--card-spacing:--spacing(4)]">
              <CardHeader className="w-full">
                <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent className="w-full">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between rounded-2xl bg-muted/50 px-4 py-3.5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex w-full items-center justify-between rounded-2xl bg-muted/50 px-4 py-3.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex w-full items-center justify-between rounded-2xl bg-muted/50 px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </main>
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
  const { slug } = Route.useParams();
  const { data: snack } = useSuspenseQuery(getSnackBySlugQueryOptions(slug));
  const ratings = useSuspenseQuery(snackRatingsQueryOptions(snack.id)).data;

  const imageUrls = snack.images.filter((img) => img.type === "default").map((img) => img.url);
  const thumbnailUrls = snack.images
    .filter((img) => img.type === "thumbnail")
    .map((img) => img.url);

  const createdAtFormatted = formatCreatedAt(snack.createdAt);

  return (
    <main className="mx-auto w-full pb-10 flex flex-col gap-10">
      <div className="flex gap-8 flex-col lg:flex-row lg:gap-15">
        <div className="mx-auto w-full max-w-md lg:sticky lg:top-8 shrink-0">
          <SnackImageSlider images={imageUrls} thumbnailUrls={thumbnailUrls} slug={slug} />
        </div>

        <div className="pt-1 grow shrink flex flex-col gap-10">
          <Card className="grow [--card-spacing:--spacing(4)]">
            <CardHeader>
              <CardTitle>
                <h2 className="text-balance text-2xl md:text-3xl font-extrabold tracking-tight">
                  {snack.name}
                </h2>
              </CardTitle>
            </CardHeader>

            <CardContent className="h-full">
              <Item variant={"muted"} className="items-start w-full h-full">
                <ItemContent>
                  <p
                    className={cn(
                      "max-w-xl text-pretty wrap-break-word leading-relaxed text-muted-foreground line-clamp-12 text-base md:text-lg",
                    )}
                  >
                    {snack.description || "Ten produkt nie ma jeszcze opisu."}
                  </p>
                </ItemContent>
              </Item>
            </CardContent>
          </Card>

          <Card className="mt-auto [--card-spacing:--spacing(4)]">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Informacje o produkcie</CardTitle>
                <time
                  className="text-sm text-muted-foreground"
                  dateTime={snack.createdAt.toISOString()}
                >
                  {createdAtFormatted}
                </time>
              </div>
            </CardHeader>
            <CardContent>
              <ItemGroup>
                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Rodzaj</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Badge
                      variant={"outline"}
                      className="text-base bg-primary/20 border-primary/30 rounded-full h-7 px-3 py-1 font-semibold"
                    >
                      {snack.type.name}
                    </Badge>
                  </ItemActions>
                </Item>
                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Średnia ocena</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <SnackRating
                      rating={ratings?.avgRating ?? snack.rating.avg}
                      ratingCount={ratings?.ratingCount ?? snack.rating.count}
                      withText
                      size="md"
                    />
                  </ItemActions>
                </Item>

                <Item variant={"muted"}>
                  <ItemContent>
                    <ItemTitle>Kod kreskowy</ItemTitle>
                    <ItemDescription className="hidden md:block">
                      Pomaga w wyszukiwaniu produktu.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SnackBarcode barcode={snack.barcode} size="sm" variant="default" />
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
      <CommentSection snackItemId={snack.id} ratingsCount={ratings.ratingCount ?? null} />
    </main>
  );
}
