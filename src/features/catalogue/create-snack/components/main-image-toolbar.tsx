import { EditIcon, TrashIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";

type Props = {
  handleRecrop: () => void;
  handleDelete: () => void;
};

export function MainImageToolbar({ handleRecrop, handleDelete }: Props) {
  return (
    <ButtonGroup>
      <TooltipTrigger>
        <Button size="icon-lg" variant="default" onClick={handleRecrop}>
          <EditIcon />
        </Button>
        <Tooltip>Przytnij zdjęcie</Tooltip>
      </TooltipTrigger>
      <AlertDialogTrigger>
        <TooltipTrigger>
          <Button size="icon-lg" variant="secondary">
            <TrashIcon />
          </Button>
          <Tooltip>Usuń zdjęcie</Tooltip>
        </TooltipTrigger>
        <AlertDialog>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunięcie zdjęcia</AlertDialogTitle>
            <AlertDialogDescription>Czy na pewno chcesz usunąć to zdjęcie?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost">Nie usuwaj</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Usuń zdjęcie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
    </ButtonGroup>
  );
}
