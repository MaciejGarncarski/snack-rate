import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
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
import { adminCommentsQueryOptions } from "#/features/admin/admin.query-options";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/u);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(adminCommentsQueryOptions());

  const deleteMutation = useMutation(
    orpc.admin.deleteComment.mutationOptions({
      onSuccess: () => {
        toast.success("Post usunięty");
        setCommentToDelete(null);
        void queryClient.invalidateQueries({ queryKey: orpc.admin.listComments.key() });
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Nie udało się usunąć";
        toast.error(msg);
      },
    }),
  );

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  if (isPending) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Spinner />
          <p className="text-muted-foreground text-sm">Ładowanie postów...</p>
        </div>
        <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="py-4">
              <CardContent className="flex items-start gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
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
    const isUnauthorized = msg.toLowerCase().includes("unauthorized");
    if (isUnauthorized) {
      void queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
    }
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {isUnauthorized ? "Brak uprawnień administratora" : "Błąd ładowania"}
        </AlertTitle>
        <AlertDescription>
          {isUnauthorized ? "Twoja sesja wygasła lub utraciła uprawnienia." : msg}
        </AlertDescription>
        <Button className="mt-4" size="sm" onPress={() => window.location.reload()}>
          {isUnauthorized ? "Odśwież" : "Spróbuj ponownie"}
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground text-sm">
        Lista postów (komentarzy) — {comments.length} pozycji
      </p>
      <Separator className="mt-4" />

      <div className="mt-4 flex flex-col gap-3">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquareOff />
                  </EmptyMedia>
                  <EmptyTitle>Brak postów</EmptyTitle>
                  <EmptyDescription>Nie ma postów do wyświetlenia.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="py-4">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{comment.authorName}</span>
                        <Badge variant="secondary">{comment.authorType}</Badge>
                        {comment.rating !== null ? (
                          <Badge variant="outline">★ {comment.rating}/10</Badge>
                        ) : null}
                      </div>
                      <a
                        href={`/produkt/${comment.snackSlug}`}
                        className="text-muted-foreground text-xs hover:underline"
                      >
                        {comment.snackName} — /produkt/{comment.snackSlug}
                      </a>
                      <span className="text-muted-foreground text-xs">
                        {new Date(comment.createdAt).toLocaleString("pl-PL")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    isDisabled={deleteMutation.isPending}
                    onPress={() => setCommentToDelete(comment.id)}
                  >
                    Usuń
                  </Button>
                </div>
                {comment.body ? (
                  <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                ) : null}
              </CardContent>
            </Card>
          ))
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
        isOpen={commentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCommentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć post?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Post zostanie trwale usunięty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                if (commentToDelete) {
                  deleteMutation.mutate({ commentId: commentToDelete });
                }
              }}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
