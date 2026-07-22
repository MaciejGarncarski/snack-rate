import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

export function ModeToggle({ withText = false }: { withText?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function toggle() {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "light" : "dark");
      return;
    }

    setTheme(theme === "light" ? "dark" : "light");
  }

  if (withText) {
    return (
      <Button variant="outline" size="default" onClick={toggle}>
        {resolvedTheme === "light" ? (
          <Sun
            data-icon="inline-start"
            className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
        ) : (
          <Moon
            data-icon="inline-start"
            className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
        )}
        <span className={"ml-2"}>Przełącz motyw</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" size={"icon"} onClick={toggle}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className={"sr-only"}>Przełącz motyw</span>
    </Button>
  );
}
