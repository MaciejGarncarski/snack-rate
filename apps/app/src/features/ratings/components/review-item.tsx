import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SnackRating } from "#/components/snacks/snack-rating";
import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { ReviewComment } from "#/features/ratings/components/review-comment";

export function ReviewItem({
  userName,
  rating,
  reviewBody,
  hasReplies,
  createdAt,
  isEdited,
}: {
  isEdited: boolean;
  userName: string;
  rating: number;
  createdAt: string;
  reviewBody: string;
  hasReplies: boolean;
}) {
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const toggleReplies = () => {
    setIsRepliesOpen((prevState) => !prevState);
  };

  const hasMoreReplies = true;
  const instant = Temporal.Instant.from(createdAt);

  return (
    <div className="py-2 max-w-full relative">
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle>
            <span>{userName}</span>
            <span className="text-muted-foreground">- {instant.toLocaleString("pl-PL")}</span>
            {isEdited && <span className="text-muted-foreground"> - (edytowany)</span>}
          </ItemTitle>
        </ItemHeader>
        <ItemContent>
          <div className="flex flex-col gap-4">
            <SnackRating rating={rating} />
            <p className="text-muted-foreground">{reviewBody}</p>
          </div>
        </ItemContent>
      </Item>
      {hasReplies && (
        <div className="ml-4 py-2">
          <Button type="button" size="xs" variant="outline" onClick={toggleReplies}>
            67 odpowiedzi
            <ChevronDown />
          </Button>
        </div>
      )}

      {isRepliesOpen && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ReviewComment
              key={index}
              userName={`Reply User ${index + 1}`}
              reviewBody={`This is a reply comment from Reply User ${index + 1}.`}
            />
          ))}

          {hasMoreReplies && (
            <div className="ml-4 py-2">
              <Button type="button" size="xs" variant="ghost">
                Załaduj więcej odpowiedzi
                <ChevronDown />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
