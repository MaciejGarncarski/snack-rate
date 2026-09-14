import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Image } from "#/components/image/image.tsx";
import { Navbar } from "#/components/layout/navbar.tsx";
import { Button } from "#/components/ui/button.tsx";
import { LinkedProvidersCard } from "#/features/auth/components/account/linked-providers-card.tsx";
import { useSession } from "#/features/auth/hooks/use-session.ts";
import { authClient } from "#/lib/auth-client.ts";
import { orpc } from "#/orpc/client.ts";

const searchSchema = z.looseObject({
  error: z.string().optional(),
});

const LINK_ERROR_MESSAGES: Record<string, string> = {
  email_does_not_match: "Adresy email się nie zgadzają. Połącz konto z tym samym adresem email.",
  account_already_linked_to_different_user: "To konto jest już połączone z innym użytkownikiem.",
  unable_to_link_account: "Nie udało się połączyć konta. Spróbuj ponownie.",
};

export const Route = createFileRoute("/auth/konto")({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: async ({ context: { ensureSession } }) => {
    const session = await ensureSession();

    if (session.user === null) {
      throw redirect({
        to: "/auth/zaloguj",
      });
    }
  },
});

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/u);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useSession();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const handledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!search.error || handledErrorRef.current === search.error) {
      return;
    }
    handledErrorRef.current = search.error;
    toast.error(
      LINK_ERROR_MESSAGES[search.error] ?? "Nie udało się połączyć konta. Spróbuj ponownie.",
    );
    void navigate({ search: {}, replace: true });
  }, [search.error, navigate]);

  return (
    <div className="min-h-svh bg-muted">
      <Navbar />
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-12 md:px-0 md:py-20">
        <h1 className="text-4xl md:text-5xl">Twoje konto</h1>

        <div className="mt-10 flex items-center gap-5">
          {data.user?.image ? (
            <Image
              src={data.user.image}
              alt="Avatar"
              placeholderSrc={data.user.image}
              containerClassName="size-20 shrink-0 rounded-xl ring-1 ring-ring"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl text-foreground">
              {getInitials(data.user?.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-medium ">{data.user?.name}</p>
            <p className="truncate text-sm text-muted-foreground">{data.user?.email}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-base font-medium ">Połączone konta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj serwisami, przez które możesz się logować.
          </p>
          <div className="mt-5">
            <LinkedProvidersCard />
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <div>
            <h2 className="text-base font-medium ">Sesja</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Wyloguje Cię tylko z tego urządzenia.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await authClient.signOut();
              await queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
              await router.invalidate();
            }}
          >
            Wyloguj
          </Button>
        </div>
      </div>
    </div>
  );
}
