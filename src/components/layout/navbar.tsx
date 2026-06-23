import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";
import { ModeToggle } from "#/components/ui/mode-toggle";
import { NavbarSearchBox } from "#/features/catalogue/search-snacks/components/search-box";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-sidebar/90 px-4 py-3 backdrop-blur-md md:px-12">
      <Link to="/">
        <h1>Snack Rate</h1>
      </Link>
      <NavbarSearchBox />

      <div className="flex items-center gap-4">
        <ModeToggle />
        <Link
          to="/dodaj-produkt"
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Dodaj produkt
        </Link>
      </div>
    </nav>
  );
}
