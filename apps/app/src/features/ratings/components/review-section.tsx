import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ItemGroup, ItemSeparator } from "#/components/ui/item";
import { ReviewItem } from "#/features/ratings/components/review-item";
import { UserReview } from "#/features/ratings/components/user-review";

type Props = {
  ratingsCount?: number | null;
};

export function ReviewSection({ ratingsCount }: Props) {
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
          {Array.from({ length: 3 }).map((_, index) => (
            <ReviewItem
              key={index}
              isEdited={Math.random() < 0.5}
              rating={Math.floor(Math.random() * 5) + 1}
              userName="John Doe"
              hasReplies={true}
              reviewBody="Tymczasowy placeholder lorem ipsum dolor sit amet Tymczasowy placeholder lorem ipsum
              dolor sit amet Tymczasowy placeholder lorem ipsum dolor sit amet Tymczasowy placeholder
              lorem ipsum dolor sit amet Tymczasowy placeholder lorem ipsum dolor sit amet"
              createdAt={new Date().toISOString()}
            />
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
