import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Image } from "#/components/image/image";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
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
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import { adminPendingSnacksQueryOptions } from "#/features/admin/admin.query-options";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/admin/snacks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [snackToReject, setSnackToReject] = useState<string | null>(null);
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(adminPendingSnacksQueryOptions());

  const reviewMutation = useMutation(
    orpc.admin.reviewSnack.mutationOptions({
      onSuccess: (result) => {
        toast.success(
          result.status === "published" ? "Zaakceptowano produkt" : "Odrzucono produkt",
        );
        setSnackToReject(null);
        void queryClient.invalidateQueries({ queryKey: orpc.admin.listPendingSnacks.key() });
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Nie udało się rozpatrzyć produktu";
        toast.error(msg);
      },
    }),
  );

  const snacks = data?.pages.flatMap((p) => p.snacks) ?? [];
  const pendingSnackId =
    reviewMutation.isPending && reviewMutation.variables
      ? reviewMutation.variables.snackItemId
      : null;

  if (isPending) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Spinner />
          <p className="text-muted-foreground text-sm">Ładowanie produktów...</p>
        </div>
        <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
          {[0, 1].map((index) => (
            <Card key={index} className="py-4">
              <CardContent className="flex items-start gap-4">
                <Skeleton className="aspect-4/5 w-16 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-8 w-24 rounded-4xl" />
                    <Skeleton className="h-8 w-20 rounded-4xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Błąd ładowania";
    return (
      <Alert variant="destructive">
        <AlertTitle>Błąd ładowania</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onPress={() => window.location.reload()}
        >
          Spróbuj ponownie
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground text-sm">
        Produkty oczekujące na akceptację — {snacks.length} pozycji
      </p>
      <Separator className="mt-4" />

      <div className="mt-4 flex flex-col gap-3">
        {snacks.length === 0 ? (
          <Card>
            <CardContent className="py-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageCheck />
                  </EmptyMedia>
                  <EmptyTitle>Brak produktów do akceptacji</EmptyTitle>
                  <EmptyDescription>Kolejka moderacji jest pusta.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          snacks.map((snack) => {
            const imageUrl =
              snack.images.find((img) => img.type === "default" && img.sortOrder === 0)?.url ??
              snack.images[0]?.url;
            const isPendingRow = pendingSnackId === snack.id;

            return (
              <Card key={snack.id} className="py-4">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start gap-4">
                    {imageUrl ? (
                      <Image
                        alt=""
                        src={imageUrl}
                        containerClassName="w-16 aspect-4/5 shrink-0 overflow-hidden rounded-xl bg-muted"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{snack.name}</span>
                        <Badge variant="secondary">{snack.typeName}</Badge>
                      </div>
                      {snack.barcode ? (
                        <span className="text-muted-foreground text-xs">Kod: {snack.barcode}</span>
                      ) : null}
                      <span className="text-muted-foreground text-xs">
                        {snack.authorName ?? "Gość"} —{" "}
                        {new Date(snack.createdAt).toLocaleString("pl-PL")}
                      </span>
                    </div>
                  </div>
                  {snack.description ? (
                    <p className="whitespace-pre-wrap text-sm">{snack.description}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <Link
                      to="/admin/snacks/$snackId"
                      params={{ snackId: snack.id }}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Podgląd
                    </Link>
                    <Button
                      size="sm"
                      isDisabled={reviewMutation.isPending}
                      onPress={() => {
                        reviewMutation.mutate({ snackItemId: snack.id, decision: "accept" });
                      }}
                    >
                      {isPendingRow ? "Zapisywanie..." : "Akceptuj"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      isDisabled={reviewMutation.isPending}
                      onPress={() => setSnackToReject(snack.id)}
                    >
                      Odrzuć
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onPress={() => fetchNextPage()} isDisabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Ładowanie..." : "Załaduj więcej"}
          </Button>
        </div>
      ) : null}

      <AlertDialog
        isOpen={snackToReject !== null}
        onOpenChange={(open) => {
          if (!open) setSnackToReject(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odrzucić produkt?</AlertDialogTitle>
            <AlertDialogDescription>
              Produkt zostanie oznaczony jako odrzucony i nie pojawi się w katalogu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                if (snackToReject) {
                  reviewMutation.mutate({ snackItemId: snackToReject, decision: "reject" });
                }
              }}
            >
              Odrzuć
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
