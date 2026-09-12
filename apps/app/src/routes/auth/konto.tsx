import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { Image } from "#/components/image/image.tsx";
import { Button } from "#/components/ui/button.tsx";
import { useSession } from "#/features/auth/hooks/use-session.ts";
import { authClient } from "#/lib/auth-client.ts";
import { orpc } from "#/orpc/client.ts";

export const Route = createFileRoute("/auth/konto")({
  component: RouteComponent,
  beforeLoad: async ({ context: { ensureSession } }) => {
    const session = await ensureSession();

    if (session.user === null) {
      throw redirect({
        to: "/auth/login",
      });
    }
  },
});

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useSession();

  return (
    <div>
      Twoje konto: {data.user?.email}
      Twoj nick: {data.user?.name}
      {data.user?.image && <Image src={data.user.image} alt="Avatar" />}
      <main>
        <Button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            await queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
            await router.invalidate();
          }}
        >
          Wyloguj
        </Button>
      </main>
    </div>
  );
}
