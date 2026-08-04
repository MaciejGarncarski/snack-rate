import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SnackRating } from "#/components/snacks/snack-rating";
import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { ReviewComment } from "#/features/ratings/components/review-comment";
import type { SnackReview } from "#/features/ratings/contracts/reviews";

export function ReviewItem({ review }: { review: SnackReview }) {
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const instant = Temporal.Instant.from(review.createdAt.toISOString());

  const toggleReplies = () => {
    setIsRepliesOpen((prevState) => !prevState);
  };

  return (
    <div className="py-2 max-w-full relative">
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle className="flex-wrap items-baseline">
            <span>{review.authorName}</span>
            <span className="text-muted-foreground text-xs md:text-sm">
              {instant.toLocaleString("pl-PL")}
            </span>
            {review.isEdited && (
              <span className="text-muted-foreground text-xs md:text-sm">(edytowany)</span>
            )}
          </ItemTitle>
        </ItemHeader>
        <ItemContent>
          <div className="flex flex-col gap-4">
            <SnackRating rating={review.rating} />
            <p className="text-muted-foreground">{review.body ?? "Brak treści recenzji."}</p>
          </div>
        </ItemContent>
      </Item>
      {review.repliesCount > 0 && (
        <div className="ml-4 py-2">
          <Button type="button" size="xs" variant="outline" onClick={toggleReplies}>
            {review.repliesCount} {review.repliesCount === 1 ? "odpowiedź" : "odpowiedzi"}
            <ChevronDown />
          </Button>
        </div>
      )}

      {isRepliesOpen && (
        <div className="flex flex-col gap-3">
          {review.replies.map((reply) => (
            <ReviewComment
              key={reply.id}
              userName={reply.authorName}
              reviewBody={reply.body}
              createdAt={reply.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
