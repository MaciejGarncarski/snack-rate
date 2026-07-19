import { Link } from "@tanstack/react-router";
import { MenuIcon, PlusIcon } from "lucide-react";

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
import { NavbarSearchBox } from "#/features/catalogue/search-snacks/components/search-box";
import { useIsMobile } from "#/hooks/use-mobile";

export function Navbar() {
  const isMobile = useIsMobile();

  return (
    <nav className="sticky top-0 z-10 grid md:grid-cols-3 grid-cols-[auto_1fr_auto] w-full items-center border-b bg-sidebar/90 px-4 py-3 backdrop-blur-md md:px-12">
      <Link to="/" className="w-fit">
        <h1 className="block md:hidden">SR</h1>
        <h1 className="hidden md:block">Snack Rate</h1>
      </Link>

      <div className="justify-self-center">
        <NavbarSearchBox />
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Link
            to="/dodaj-produkt"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Dodaj produkt
          </Link>
        </div>

        {isMobile && (
          <SheetTrigger>
            <Button variant="outline" size="icon" aria-label="Menu">
              <MenuIcon className="h-5 w-5" />
            </Button>
            <Sheet side="right" className="flex">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-6">
                <ModeToggle withText />
                <Link
                  to="/dodaj-produkt"
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
                <SheetClose variant="outline">Close</SheetClose>
              </SheetFooter>
            </Sheet>
          </SheetTrigger>
        )}
      </div>
    </nav>
  );
}
