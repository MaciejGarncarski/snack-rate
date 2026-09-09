import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SnackRating } from "#/components/snacks/snack-rating";
import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { CommentReactions } from "#/features/comments/components/comment-reactions";
import type { SnackComment } from "#/features/comments/contracts/comments";

export function CommentItem({
  comment,
  snackItemId,
}: {
  comment: SnackComment;
  snackItemId: string;
}) {
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const instant = Temporal.Instant.from(comment.createdAt.toISOString());

  const toggleReplies = () => {
    setIsRepliesOpen((prevState) => !prevState);
    // oxlint-disable-next-line no-console
    console.log("toggleReplies", isRepliesOpen);
  };

  const openReplyForm = () => {
    setIsReplying(true);
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
            <SnackRating rating={comment.rating} withText />
            <p className="text-muted-foreground">{comment.body ?? "Brak treści recenzji."}</p>
            <div className="flex flex-row gap-2">
              <CommentReactions comment={comment} snackItemId={snackItemId} />
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={openReplyForm}>
                  Odpowiedz
                </Button>
              </div>
            </div>
          </div>
        </ItemContent>
      </Item>
      {isReplying && (
        <div className="ml-4 py-2">
          {/* <CommentReplyForm /> */}
          aaaaaaaaa
        </div>
      )}

      {/* {isRepliesOpen && (
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
      )} */}

      {comment.hasReplies && (
        <div className="ml-2 py-2">
          <Button type="button" size="xs" variant="outline" onClick={toggleReplies}>
            <ChevronDown />
            Załaduj odpowiedzi
            {/* {comment.repliesCount} {comment.repliesCount === 1 ? "odpowiedź" : "odpowiedzi"} */}
          </Button>
        </div>
      )}
    </div>
  );
}
