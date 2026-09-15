import { EllipsisIcon } from "lucide-react";

import { CommonAlertDialog } from "#/components/layout/common-alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";

type Props = {
  onEdit: () => void;
  onRemove: () => void;
  isRemoveOpen: boolean;
  setIsRemoveOpen: (open: boolean) => void;
  editLabel?: string;
  removeLabel?: string;
  removeTitle?: string;
  removeDescription?: string;
};

export function CurrentUserCommentMenu({
  isRemoveOpen,
  setIsRemoveOpen,
  onEdit,
  onRemove,
  editLabel = "Zmień ocenę",
  removeLabel = "Usuń ocenę",
  removeTitle = "Usuń ocenę",
  removeDescription = "Czy na pewno chcesz usunąć swoją ocenę?",
}: Props) {
  return (
    <>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon-sm" className="ml-auto">
          <EllipsisIcon />
        </Button>
        <DropdownMenu>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem onAction={onEdit}>{editLabel}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onAction={() => setIsRemoveOpen(true)}>
              {removeLabel}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenu>
      </DropdownMenuTrigger>

      <CommonAlertDialog
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        cancelText="Nie usuwaj"
        proceedText="Usuń"
        title={removeTitle}
        description={removeDescription}
        onCancel={() => {}}
        onProceed={onRemove}
      />
    </>
  );
}
