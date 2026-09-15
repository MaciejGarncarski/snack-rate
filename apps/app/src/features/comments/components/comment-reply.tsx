import { useState } from "react";

import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { AddReplyForm } from "#/features/comments/components/add-reply-form.tsx";
import { CurrentUserCommentMenu } from "#/features/comments/components/current-user-comment-menu.tsx";
import type { SnackReply } from "#/features/comments/contracts/comments";
import { useRemoveReply } from "#/features/comments/queries/use-remove-reply";

type Props = {
  reply: SnackReply;
  snackItemId: string;
  parentCommentId: string;
};

export function CommentReply({ reply, snackItemId, parentCommentId }: Props) {
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const instant = Temporal.Instant.from(reply.createdAt.toISOString());

  const removeReply = useRemoveReply({ parentCommentId });

  const onRemove = () => {
    removeReply.mutate({ replyId: reply.id });
  };

  if (isEditing) {
    return (
      <AddReplyForm
        isEditing
        initialBody={reply.body ?? ""}
        replyId={reply.id}
        snackItemId={snackItemId}
        parentCommentId={parentCommentId}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Item variant="muted" className="ml-4 min-w-0 w-auto py-2">
      <ItemHeader>
        <ItemTitle>
          <span>{reply.authorName}</span>
          {reply.isUserAuthor && <span className="text-muted-foreground text-xs">(Ty)</span>}
          <span className="text-muted-foreground"> - {instant.toLocaleString("pl-PL")}</span>
          {reply.isEdited && <span className="text-muted-foreground text-xs">(edytowana)</span>}
        </ItemTitle>

        {reply.isUserAuthor && (
          <CurrentUserCommentMenu
            isRemoveOpen={isRemoveOpen}
            setIsRemoveOpen={setIsRemoveOpen}
            onEdit={() => setIsEditing(true)}
            onRemove={onRemove}
            editLabel="Edytuj odpowiedź"
            removeLabel="Usuń odpowiedź"
            removeTitle="Usuń odpowiedź"
            removeDescription="Czy na pewno chcesz usunąć swoją odpowiedź?"
          />
        )}
      </ItemHeader>
      <ItemContent>
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground wrap-break-word">
            {reply.body ?? "Brak treści komentarza."}
          </p>
        </div>
      </ItemContent>
    </Item>
  );
}
