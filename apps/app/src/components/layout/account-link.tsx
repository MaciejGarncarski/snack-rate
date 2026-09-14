import { Link } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";

import { buttonVariants } from "#/components/ui/button.tsx";

type Props = {
  isLoggedIn: boolean;
  userImage?: string | null;
};

export function AccountLink({ isLoggedIn, userImage }: Props) {
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
