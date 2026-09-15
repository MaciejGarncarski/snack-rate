import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import { adminSnackQueryOptions } from "#/features/admin/admin.query-options";
import { SnackEditCard } from "#/features/admin/components/snack-edit-card";
import { SnackImagesCard } from "#/features/admin/components/snack-images-card";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/admin/snacks/$snackId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { snackId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const snackQuery = useQuery(adminSnackQueryOptions(snackId));

  const reviewMutation = useMutation(
    orpc.admin.reviewSnack.mutationOptions({
      onSuccess: (result) => {
        toast.success(
          result.status === "published" ? "Zaakceptowano produkt" : "Odrzucono produkt",
        );
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.admin.getSnack.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.admin.listPendingSnacks.key() }),
        ]).then(() => navigate({ to: "/admin/snacks" }));
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Nie udało się rozpatrzyć produktu");
      },
    }),
  );

  if (snackQuery.isPending) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Spinner />
          <p className="text-muted-foreground text-sm">Ładowanie produktu...</p>
        </div>
        <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (snackQuery.isError || !snackQuery.data) {
    const msg = snackQuery.error instanceof Error ? snackQuery.error.message : "Błąd ładowania";
    return (
      <Alert variant="destructive">
        <AlertTitle>Błąd ładowania</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-4" onPress={() => snackQuery.refetch()}>
          Spróbuj ponownie
        </Button>
      </Alert>
    );
  }

  const snack = snackQuery.data.snack;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/admin/snacks"
        className="text-muted-foreground flex w-fit items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft className="size-4" />
        Wróć do kolejki
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">{snack.name}</h2>
        <Badge variant={snack.status === "pending" ? "secondary" : "default"}>{snack.status}</Badge>
        <Badge variant="outline">{snack.typeName}</Badge>
        {snack.ratingCount > 0 ? (
          <Badge variant="outline">
            ★ {snack.avgRating.toFixed(2)} ({snack.ratingCount})
          </Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Szczegóły</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono text-xs">{snack.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Kod kreskowy</dt>
              <dd>{snack.barcode ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Autor</dt>
              <dd>{snack.authorName ?? "Gość"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Utworzono</dt>
              <dd>{new Date(snack.createdAt).toLocaleString("pl-PL")}</dd>
            </div>
          </dl>
          {snack.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm">{snack.description}</p>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">Brak opisu.</p>
          )}
        </CardContent>
      </Card>

      <SnackImagesCard snack={snack} />

      <SnackEditCard snack={snack} />

      {snack.status === "pending" ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            isDisabled={reviewMutation.isPending}
            onPress={() => reviewMutation.mutate({ snackItemId: snack.id, decision: "accept" })}
          >
            {reviewMutation.isPending ? "Zapisywanie..." : "Akceptuj"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isDisabled={reviewMutation.isPending}
            onPress={() => reviewMutation.mutate({ snackItemId: snack.id, decision: "reject" })}
          >
            Odrzuć
          </Button>
        </div>
      ) : null}
    </div>
  );
}
