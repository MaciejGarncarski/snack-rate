import { CropIcon, TrashIcon } from "lucide-react";

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
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";

type Props = {
  handleRecrop: () => void;
  handleDelete: () => void;
};

export function MainImageToolbar({ handleRecrop, handleDelete }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <TooltipTrigger>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={handleRecrop}
          aria-label="Przytnij zdjęcie"
          className="size-8 rounded-full border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <CropIcon className="size-3.5" />
        </Button>
        <Tooltip>Przytnij</Tooltip>
      </TooltipTrigger>

      <AlertDialogTrigger>
        <TooltipTrigger>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Usuń zdjęcie"
            className="size-8 rounded-full border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <TrashIcon className="size-3.5" />
          </Button>
          <Tooltip>Usuń</Tooltip>
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
    </div>
  );
}
