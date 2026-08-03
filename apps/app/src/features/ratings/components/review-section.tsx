import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ItemGroup, ItemSeparator } from "#/components/ui/item";
import { ReviewItem } from "#/features/ratings/components/review-item";
import { UserReview } from "#/features/ratings/components/user-review";
import { snackReviewsQueryOptions } from "#/features/ratings/queries/reviews.query-options";

type Props = {
  snackItemId: string;
  ratingsCount?: number | null;
};

export function ReviewSection({ snackItemId, ratingsCount }: Props) {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    snackReviewsQueryOptions(snackItemId),
  );

  const { ref } = useInView({
    rootMargin: "400px",
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const reviews = data.pages.flatMap((page) => page.items);

  return (
    <Card className="[--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle>
          Sprawdź oceny tego produktu{" "}
          <span className="text-muted-foreground">({ratingsCount ?? 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <UserReview />
          <ItemSeparator />
          {reviews.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Ten produkt nie ma jeszcze recenzji. Bądź pierwszą osobą, która go oceni!
            </p>
          ) : (
            reviews.map((review) => <ReviewItem key={review.id} review={review} />)
          )}
        </ItemGroup>
        <div ref={ref} />
      </CardContent>
    </Card>
  );
}
