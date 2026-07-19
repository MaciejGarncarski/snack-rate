import { useBlocker } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";

type Props = {
  shouldBlock: boolean;
  title?: string;
  description?: string;
};

const defaultTitle = "Czy na pewno chcesz opuścić stronę?";
const defaultDescription = "Wprowadzone zmiany zostaną utracone.";

export function NavigationBlock({ shouldBlock, title, description }: Props) {
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => shouldBlock,
    withResolver: true,
  });

  return (
    <AlertDialog isOpen={status === "blocked"}>
      <AlertDialogHeader>
        <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
        <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="ghost" onClick={reset}>
          Pozostań na stronie
        </AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={proceed}>
          Opuść stronę
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialog>
  );
}
