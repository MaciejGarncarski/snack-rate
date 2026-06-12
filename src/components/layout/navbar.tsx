import { Link } from "@tanstack/react-router";

import { NavbarSearchBox } from "#/features/search-box/components/search-box";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between bg-accent/90 px-4 py-3 backdrop-blur-md md:px-20">
      <Link to="/">
        <h1>Snack Rate</h1>
      </Link>
      <NavbarSearchBox />
      <div>MENU</div>
    </nav>
  );
}
