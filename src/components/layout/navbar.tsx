import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { NavbarMobileMenu } from "#/components/layout/navbar-mobile-menu";
import { buttonVariants } from "#/components/ui/button";
import { ModeToggle } from "#/components/ui/mode-toggle";
import { Skeleton } from "#/components/ui/skeleton";
import { NavbarSearchBox } from "#/features/catalogue/search-snacks/components/search-box";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 grid md:grid-cols-3 grid-cols-[minmax(3rem,auto)_1fr_minmax(3rem,auto)] w-full items-center border-b bg-sidebar/90 px-4 py-3 backdrop-blur-md md:px-12">
      <Link to="/" className="w-fit">
        <h1 className="block md:hidden">SR</h1>
        <h1 className="hidden md:block">Snack Rate</h1>
      </Link>

      <div className="justify-self-center">
        <NavbarSearchBox />
      </div>

      <ClientOnly
        fallback={
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <Skeleton className="w-9 md:w-32 h-9" />
          </div>
        }
      >
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Link
              to="/zaproponuj"
              className={buttonVariants({ variant: "default", size: "default" })}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Dodaj produkt
            </Link>
          </div>
          <NavbarMobileMenu />
        </div>
      </ClientOnly>
    </nav>
  );
}
