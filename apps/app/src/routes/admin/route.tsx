import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useMatchRoute,
  useRouter,
} from "@tanstack/react-router";

import { Button, buttonVariants } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { adminAuthQueryOptions } from "#/features/admin/admin.query-options";
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
  const matchRoute = useMatchRoute();
  const authQuery = useQuery(adminAuthQueryOptions);
  const user = authQuery.data?.user ?? null;
  const isAdmin = (user as { role?: string } | null)?.role === "admin";

  const tab = matchRoute({ to: "/admin/snacks", fuzzy: true }) ? "snacks" : "comments";

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

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <Button variant="outline" onPress={handleLogout}>
          Wyloguj
        </Button>
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => {
          if (key === "snacks") {
            void router.navigate({ to: "/admin/snacks" });
          } else {
            void router.navigate({ to: "/admin" });
          }
        }}
        className="mt-4"
      >
        <TabsList>
          <TabsTrigger id="comments">Posty</TabsTrigger>
          <TabsTrigger id="snacks">Produkty do akceptacji</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
