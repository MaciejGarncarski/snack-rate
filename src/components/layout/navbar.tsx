import { Link } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button";
import { NavbarSearchBox } from "#/features/catalogue/components/search-box/components/search-box";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-sidebar/90 px-4 py-3 backdrop-blur-md md:px-12">
      <Link to="/">
        <h1>Snack Rate</h1>
      </Link>
      <NavbarSearchBox />

      <div>
        <Link to="/new-snack" className={buttonVariants({ variant: "default", size: "sm" })}>
          Add Snack
        </Link>
      </div>
    </nav>
  );
}
