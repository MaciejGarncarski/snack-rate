import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";

import { Button, buttonVariants } from "#/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "#/components/ui/empty";

export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="">
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyTitle>Błąd 500 - Wewnętrzny błąd serwera</EmptyTitle>
          <EmptyDescription>
            Ups, wygląda na to, że coś poszło nie tak na serwerze.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Link
              to="/"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-border",
              })}
            >
              <HomeIcon />
              Strona główna
            </Link>

            <Button onClick={reset}>Spróbuj ponownie</Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
