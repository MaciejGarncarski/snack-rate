import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
  adminAuthQueryOptions,
  adminCommentsQueryOptions,
} from "#/features/admin/admin.query-options";
import { orpc } from "#/orpc/client";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [inputPassword, setInputPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const authQuery = useQuery(adminAuthQueryOptions);
  const isAuthenticated = authQuery.data?.ok === true;
  const isAuthPending = authQuery.isPending;
  const isAuthError = authQuery.isError;

  const verifyMutation = useMutation(
    orpc.admin.verifyPassword.mutationOptions({
      onSuccess: () => {
        setAuthError(null);
        setInputPassword("");
        toast.success("Zalogowano do panelu admina");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.checkAuth.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.admin.listComments.key() });
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Nieprawidłowe hasło";
        setAuthError(message);
        toast.error(message);
      },
    }),
  );

  const logoutMutation = useMutation(
    orpc.admin.logout.mutationOptions({
      onSuccess: () => {
        toast.success("Wylogowano");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.checkAuth.key() });
        void queryClient.setQueryData(orpc.admin.checkAuth.key(), null);
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Błąd wylogowania";
        toast.error(message);
      },
    }),
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setAuthError("Podaj hasło");
      return;
    }
    verifyMutation.mutate({ password: inputPassword });
  };

  const handleLogout = () => {
    logoutMutation.mutate({});
  };

  if (isAuthPending) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-muted-foreground">Sprawdzanie autoryzacji...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Panel administratora</CardTitle>
            <CardDescription>Podaj hasło aby uzyskać dostęp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="Hasło"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
              />
              {authError ? <p className="text-destructive text-sm">{authError}</p> : null}
              {isAuthError && !authError ? (
                <p className="text-muted-foreground text-sm">
                  Sesja wygasła — zaloguj się ponownie
                </p>
              ) : null}
              <Button type="submit" isDisabled={verifyMutation.isPending}>
                {verifyMutation.isPending ? "Logowanie..." : "Zaloguj"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} isLoggingOut={logoutMutation.isPending} />;
}

function AdminDashboard({
  onLogout,
  isLoggingOut,
}: {
  onLogout: () => void;
  isLoggingOut?: boolean;
}) {
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
          <Button variant="outline" onPress={onLogout} isDisabled={isLoggingOut}>
            Wyloguj
          </Button>
        </div>
        <p className="text-muted-foreground mt-6">Ładowanie...</p>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Błąd ładowania";
    const isUnauthorized =
      msg.toLowerCase().includes("hasło") || msg.toLowerCase().includes("unauthorized");
    if (isUnauthorized) {
      void queryClient.invalidateQueries({ queryKey: orpc.admin.checkAuth.key() });
      return (
        <div className="mx-auto max-w-3xl p-6">
          <p className="text-destructive">Sesja wygasła lub hasło nieprawidłowe.</p>
          <Button className="mt-4" onPress={() => window.location.reload()}>
            Odśwież i zaloguj ponownie
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
        <Button variant="outline" onPress={onLogout} isDisabled={isLoggingOut}>
          {isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}
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
