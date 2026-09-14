import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
  adminAuthQueryOptions,
  adminCommentsQueryOptions,
} from "#/features/admin/admin.query-options";
import { authClient } from "#/lib/auth-client.ts";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  ssr: false,
  loader: async ({ context: { ensureSession } }) => {
    const session = await ensureSession();

    if (!session.user || session.user.role !== "admin") {
      throw redirect({ to: "/auth/zaloguj" });
    }
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const authQuery = useQuery(adminAuthQueryOptions);
  const user = authQuery.data?.user ?? null;
  const isAdmin = (user as { role?: string } | null)?.role === "admin";

  const handleLogout = async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
    await router.invalidate();
  };

  if (authQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-muted-foreground">Sprawdzanie autoryzacji...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Panel administratora</CardTitle>
            <CardDescription>Musisz się zalogować, aby uzyskać dostęp</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth/zaloguj" className={buttonVariants()}>
              Przejdź do logowania
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Brak dostępu</CardTitle>
            <CardDescription>Konto {user.email} nie ma uprawnień administratora</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onPress={handleLogout}>
              Wyloguj
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(adminCommentsQueryOptions());

  const deleteMutation = useMutation(
    orpc.admin.deleteComment.mutationOptions({
      onSuccess: () => {
        toast.success("Post usunięty");
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
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <Button variant="outline" onPress={onLogout}>
            Wyloguj
          </Button>
        </div>
        <p className="text-muted-foreground mt-6">Ładowanie...</p>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Błąd ładowania";
    const isUnauthorized = msg.toLowerCase().includes("unauthorized");
    if (isUnauthorized) {
      void queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
      return (
        <div className="mx-auto max-w-3xl p-6">
          <p className="text-destructive">Brak uprawnień administratora.</p>
          <Button className="mt-4" onPress={() => window.location.reload()}>
            Odśwież
          </Button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-destructive">{msg}</p>
        <Button variant="outline" className="mt-4" onPress={() => window.location.reload()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Lista postów (komentarzy) — {comments.length} pozycji
          </p>
        </div>
        <Button variant="outline" onPress={onLogout}>
          Wyloguj
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Brak postów do wyświetlenia</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="py-4">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
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
                  <Button
                    variant="destructive"
                    size="sm"
                    isDisabled={deleteMutation.isPending}
                    onPress={() => {
                      if (window.confirm("Czy na pewno usunąć ten post?")) {
                        deleteMutation.mutate({ commentId: comment.id });
                      }
                    }}
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
    </div>
  );
}
