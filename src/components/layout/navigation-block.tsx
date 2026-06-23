import { useBlocker } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";

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
    <AlertDialog open={status === "blocked"}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" onClick={reset} />}>
            Pozostań na stronie
          </AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" onClick={proceed} />}>
            Opuść stronę
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
