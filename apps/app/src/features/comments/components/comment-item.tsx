import { ChevronDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import type { SnackComment } from "#/features/comments/contracts/comments";

export function CommentItem({ comment }: { comment: SnackComment }) {
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
            {/* <SnackRating rating={comment.rating} /> */}
            <p>
              Ocena: <span className="font-bold">{comment.rating}</span>/10
            </p>
            <p className="text-muted-foreground">{comment.body ?? "Brak treści recenzji."}</p>
            <div className="flex gap-4">
              <Button size="xs">
                <ThumbsUp /> 67
              </Button>
              <Button size="xs" variant="ghost" onClick={openReplyForm}>
                Odpowiedz
              </Button>
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
        <div className="ml-4 py-2">
          <Button type="button" size="xs" variant="outline" onClick={toggleReplies}>
            test
            {/* {comment.repliesCount} {comment.repliesCount === 1 ? "odpowiedź" : "odpowiedzi"} */}
            <ChevronDown />
          </Button>
        </div>
      )}
    </div>
  );
}
