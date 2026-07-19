import { Moon, Sun } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useTheme } from "#/components/ui/theme-provider";
import { cn } from "#/lib/utils";

export function ModeToggle({ withText = false }: { withText?: boolean }) {
  const { theme, setTheme } = useTheme();

  function toggle() {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "light" : "dark");
      return;
    }

    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <Button variant="outline" size={withText ? "default" : "icon"} onClick={toggle}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className={cn(withText ? "ml-2" : "sr-only")}>Przełącz motyw</span>
    </Button>
  );
}
