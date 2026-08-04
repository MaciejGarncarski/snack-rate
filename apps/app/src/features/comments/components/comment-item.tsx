import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SnackRating } from "#/components/snacks/snack-rating";
import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { CommentReply } from "#/features/comments/components/comment-reply";
import type { SnackComment } from "#/features/comments/contracts/comments";

export function CommentItem({ comment }: { comment: SnackComment }) {
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const instant = Temporal.Instant.from(comment.createdAt.toISOString());

  const toggleReplies = () => {
    setIsRepliesOpen((prevState) => !prevState);
  };

  return (
    <div className="py-2 max-w-full relative">
      <Item variant="muted">
        <ItemHeader>
          <ItemTitle className="flex-wrap items-baseline">
            <span>{comment.authorName}</span>
            <span className="text-muted-foreground text-xs md:text-sm">
              {instant.toLocaleString("pl-PL")}
            </span>
            {comment.isEdited && (
              <span className="text-muted-foreground text-xs md:text-sm">(edytowany)</span>
            )}
          </ItemTitle>
        </ItemHeader>
        <ItemContent>
          <div className="flex flex-col gap-4">
            <SnackRating rating={comment.rating} />
            <p className="text-muted-foreground">{comment.body ?? "Brak treści recenzji."}</p>
          </div>
        </ItemContent>
      </Item>
      {comment.repliesCount > 0 && (
        <div className="ml-4 py-2">
          <Button type="button" size="xs" variant="outline" onClick={toggleReplies}>
            {comment.repliesCount} {comment.repliesCount === 1 ? "odpowiedź" : "odpowiedzi"}
            <ChevronDown />
          </Button>
        </div>
      )}

      {isRepliesOpen && (
        <div className="flex flex-col gap-3">
          {comment.replies.map((reply) => (
            <CommentReply
              key={reply.id}
              userName={reply.authorName}
              body={reply.body}
              createdAt={reply.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
