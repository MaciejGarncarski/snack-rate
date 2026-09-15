import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Image } from "#/components/image/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { AdminSnackDetail } from "#/features/admin/server/admin-snacks.repository";
import { orpc } from "#/orpc/client";

function useInvalidateSnacks() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.admin.getSnack.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.admin.listPendingSnacks.key() }),
    ]);
}

export function SnackImagesCard({ snack }: { snack: AdminSnackDetail }) {
  const invalidateSnacks = useInvalidateSnacks();
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const reorderMutation = useMutation(
    orpc.admin.reorderSnackImages.mutationOptions({
      onSuccess: () => {
        void invalidateSnacks();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Nie udało się zmienić kolejności");
      },
    }),
  );

  const deleteImageMutation = useMutation(
    orpc.admin.deleteSnackImage.mutationOptions({
      onSuccess: () => {
        toast.success("Usunięto grafikę");
        setImageToDelete(null);
        void invalidateSnacks();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Nie udało się usunąć grafiki");
      },
    }),
  );

  const defaultImages = snack.images
    .filter((img) => img.type === "default")
    .toSorted((a, b) => a.sortOrder - b.sortOrder);
  const isMutating = reorderMutation.isPending || deleteImageMutation.isPending;

  const moveImage = (imageId: string, direction: -1 | 1) => {
    const index = defaultImages.findIndex((img) => img.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= defaultImages.length) return;
    const ordered = defaultImages.map((img) => img.id);
    const [moved] = ordered.splice(index, 1);
    ordered.splice(target, 0, moved!);
    reorderMutation.mutate({ snackItemId: snack.id, orderedImageIds: ordered });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grafiki ({defaultImages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {defaultImages.length === 0 ? (
            <p className="text-muted-foreground text-sm">Brak grafik.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {defaultImages.map((img, index) => (
                <div key={img.id} className="flex flex-col gap-1">
                  <Image
                    alt=""
                    src={img.url}
                    containerClassName="aspect-4/5 w-full overflow-hidden rounded-xl bg-muted"
                    className="h-full w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-muted-foreground text-xs">Pozycja {index + 1}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Przesuń w górę"
                        isDisabled={isMutating || index === 0}
                        onPress={() => moveImage(img.id, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Przesuń w dół"
                        isDisabled={isMutating || index === defaultImages.length - 1}
                        onPress={() => moveImage(img.id, 1)}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        aria-label="Usuń grafikę"
                        isDisabled={isMutating}
                        onPress={() => setImageToDelete(img.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        isOpen={imageToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setImageToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć grafikę?</AlertDialogTitle>
            <AlertDialogDescription>
              Grafika (wraz z miniaturą) zostanie trwale usunięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                if (imageToDelete) {
                  deleteImageMutation.mutate({ snackItemId: snack.id, imageId: imageToDelete });
                }
              }}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
