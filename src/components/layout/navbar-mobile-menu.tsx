import { Link } from "@tanstack/react-router";
import { MenuIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { ModeToggle } from "#/components/ui/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";
import { useIsMobile } from "#/hooks/use-mobile";

export function NavbarMobileMenu() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <SheetTrigger>
      <Button variant="outline" size="icon" aria-label="Menu" onClick={() => setIsSheetOpen(true)}>
        <MenuIcon className="h-5 w-5" />
      </Button>
      <Sheet side="right" className="flex" isOpen={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-6">
          <ModeToggle withText />
          <Link
            to="/zaproponuj"
            onClick={closeSheet}
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "w-full",
            })}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Dodaj produkt
          </Link>
        </div>
        <SheetFooter>
          <SheetClose variant="outline">Zamknij</SheetClose>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
