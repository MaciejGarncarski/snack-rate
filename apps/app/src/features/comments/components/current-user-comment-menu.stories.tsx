import preview from "$/preview";
import { useState } from "react";

import { CurrentUserCommentMenu } from "./current-user-comment-menu";

function InteractiveMenu({
  editLabel,
  removeLabel,
  removeTitle,
  removeDescription,
}: {
  editLabel?: string;
  removeLabel?: string;
  removeTitle?: string;
  removeDescription?: string;
}) {
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  return (
    <CurrentUserCommentMenu
      isRemoveOpen={isRemoveOpen}
      setIsRemoveOpen={setIsRemoveOpen}
      onEdit={() => {}}
      onRemove={() => setIsRemoveOpen(false)}
      editLabel={editLabel}
      removeLabel={removeLabel}
      removeTitle={removeTitle}
      removeDescription={removeDescription}
    />
  );
}

const meta = preview.meta({
  title: "Features/Comments/CurrentUserCommentMenu",
  component: InteractiveMenu,
});

export default meta;

export const RatingMenu = meta.story({});

export const ReplyMenu = meta.story({
  args: {
    editLabel: "Edytuj odpowiedź",
    removeLabel: "Usuń odpowiedź",
    removeTitle: "Usuń odpowiedź",
    removeDescription: "Czy na pewno chcesz usunąć swoją odpowiedź?",
  },
});
