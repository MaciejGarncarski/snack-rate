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

type Props = {
  title: string;
  description: string;
  cancelText: string;
  proceedText: string;
  onCancel: () => void;
  onProceed: () => void;
  children?: React.ReactNode;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommonAlertDialog({
  title,
  description,
  cancelText,
  proceedText,
  onCancel,
  onProceed,
  children,
  onOpenChange,
  open,
}: Props) {
  const body = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="ghost" onClick={onCancel}>
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onProceed}>
          {proceedText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );

  if (!children) {
    return (
      <AlertDialog isOpen={open} onOpenChange={onOpenChange}>
        {body}
      </AlertDialog>
    );
  }

  return (
    <AlertDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      {children}
      <AlertDialog>{body}</AlertDialog>
    </AlertDialogTrigger>
  );
}
