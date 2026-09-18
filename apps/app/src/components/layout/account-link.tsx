import { Link } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import { Suspense } from "react";

import { buttonVariants } from "#/components/ui/button.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { useSession } from "#/features/auth/hooks/use-session.ts";

export function AccountLink() {
  return (
    <Suspense fallback={<Skeleton className="h-9 w-30" />}>
      <AccountLinkInner />
    </Suspense>
  );
}

function AccountLinkInner() {
  const { data } = useSession();

  const isLoggedIn = !!data.user;
  const userImage = data.user?.image;

  if (isLoggedIn) {
    return (
      <Link
        to="/auth/konto"
        aria-label="Moje konto"
        className={buttonVariants({ variant: "secondary", size: "default" })}
      >
        {userImage ? (
          <img src={userImage} alt="Avatar" className="size-6 rounded-sm" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
        Moje konto
      </Link>
    );
  }

  return (
    <Link
      to="/auth/zaloguj"
      aria-label="Zaloguj się"
      className={buttonVariants({ variant: "secondary", size: "default" })}
    >
      <UserIcon className="h-4 w-4" />
      Zaloguj się
    </Link>
  );
}
