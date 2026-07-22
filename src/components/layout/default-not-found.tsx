import { Link } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function DefaultNotFound() {
  return (
    <div className="h-screen">
      <Empty className="h-full bg-secondary">
        <EmptyHeader>
          <EmptyTitle>Błąd 404 - Nie znaleziono strony</EmptyTitle>
          <EmptyDescription>Ups, wygląda na to, że ta strona nie istnieje.</EmptyDescription>
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
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
