import { Moon, Sun } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useTheme } from "#/components/ui/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenuTrigger>
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Przełącz motyw</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setTheme("light")}>Jasny</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Ciemny</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>Systemowy</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}
