import { useMutation } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { toast } from "sonner";

import { NavigationBlock } from "#/components/layout/navigation-block.tsx";
import { TurnstileWidget } from "#/components/turnstile-widget.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { commentRepliesQueryOptions } from "#/features/comments/queries/comments.query-options";
import { useEditReply } from "#/features/comments/queries/use-edit-reply";
import { orpc } from "#/orpc/client.ts";

type Props = {
  onClose: () => void;
  snackItemId: string;
  parentCommentId: string;
  isEditing?: boolean;
  initialBody?: string;
  replyId?: string;
};

export function AddReplyForm({
  onClose,
  snackItemId,
  parentCommentId,
  isEditing = false,
  initialBody = "",
  replyId,
}: Props) {
  const [value, setValue] = useState(initialBody);
  const [token, setToken] = useState<string | null>(null);

  const editReply = useEditReply({ parentCommentId });

  const { mutate } = useMutation(
    orpc.comments.addReply.mutationOptions({
      onSuccess: (_result, vars, _a, context) => {
        void context.client.invalidateQueries(commentRepliesQueryOptions(vars.commentId));
        clearForm();
        toast.success("Odpowiedź została dodana pomyślnie.");
      },
      onError: (error) => {
        toast.error(`Wystąpił błąd podczas dodawania odpowiedzi: ${error.message}`);
      },
    }),
  );

  const clearForm = () => {
    setValue("");
    setToken(null);
  };

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClose();
    if (isEditing) {
      if (!replyId) return;
      editReply.mutate({
        replyId,
        body: value,
        token: token || "",
      });
    } else {
      mutate({
        snackItemId: snackItemId,
        commentId: parentCommentId,
        body: value,
        token: token || "",
      });
    }
    clearForm();
  };

  return (
    <Item variant="muted">
      <ItemHeader>
        <ItemTitle className="flex-wrap items-baseline">
          {isEditing ? "Edytuj odpowiedź" : "Dodaj odpowiedź"}
        </ItemTitle>
      </ItemHeader>
      <ItemContent>
        <NavigationBlock
          shouldBlock={true}
          description={
            isEditing
              ? "Edytowanie odpowiedzi będzie anulowane"
              : "Dodawanie odpowiedzi będzie anulowane"
          }
        />

        <form onSubmit={onSubmit}>
          <div className="flex flex-col md:flex-row gap-2 md:gap-10">
            <Textarea
              placeholder="Napisz odpowiedź..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex flex-col gap-2 ">
              <Button type="submit" isDisabled={editReply.isPending}>
                {isEditing ? "Zapisz" : "Wyślij"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
            </div>
          </div>

          <TurnstileWidget
            onVerify={(tokenValue) => {
              if (tokenValue) {
                setToken(tokenValue);
              }
            }}
          />
        </form>
      </ItemContent>
    </Item>
  );
}
