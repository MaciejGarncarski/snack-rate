import { EllipsisIcon } from "lucide-react";
import { useState } from "react";

import { CommonAlertDialog } from "#/components/layout/common-alert-dialog";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

type Props = {
  userRating: number;
  userBody: string | null;
  onEdit: () => void;
  onRemove: () => void;
};

export function UserReviewItem({ userRating, userBody, onEdit, onRemove }: Props) {
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  return (
    <div className="flex items-start justify-between gap-4 flex-row">
      <div className="flex min-w-0 flex-col items-center gap-2">
        <div className="flex flex-col gap-4">
          <SnackRating rating={userRating} size="md" />
          {userBody ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">{userBody}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Brak treści recenzji.</p>
          )}
        </div>
      </div>

      <DropdownMenuTrigger>
        <Button variant="outline" size="icon-sm">
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
    </div>
  );
}
