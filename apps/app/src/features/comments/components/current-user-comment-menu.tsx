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
};

export function CurrentUserCommentMenu({ isRemoveOpen, setIsRemoveOpen, onEdit, onRemove }: Props) {
  return (
    <>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon-sm" className="ml-auto">
          <EllipsisIcon />
        </Button>
        <DropdownMenu>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem onAction={onEdit}>Zmień ocenę</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onAction={() => setIsRemoveOpen(true)}>
              Usuń ocenę
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenu>
      </DropdownMenuTrigger>

      <CommonAlertDialog
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        cancelText="Nie usuwaj"
        proceedText="Usuń"
        title="Usuń ocenę"
        description="Czy na pewno chcesz usunąć swoją ocenę?"
        onCancel={() => {}}
        onProceed={onRemove}
      />
    </>
  );
}
