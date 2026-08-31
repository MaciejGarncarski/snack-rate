import { ScriptOnce } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

function getThemeScript(storageKey: string) {
  const key = JSON.stringify(storageKey);

  return `(function(){try{var t=localStorage.getItem(${key});var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='dark'||t==='light'?t:(d?'dark':'light');var e=document.documentElement;e.classList.add('disable-transition');e.classList.add(r);e.style.colorScheme=r;requestAnimationFrame(function(){requestAnimationFrame(function(){e.classList.remove('disable-transition')})})}catch(e){}})();`;
}

function resolveTheme(osPrefersDark: boolean, override: "dark" | "light" | null): "light" | "dark" {
  if (override) return override;
  return osPrefersDark ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.add("disable-transition");
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("disable-transition");
    });
  });
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children, storageKey = "theme" }: ThemeProviderProps) {
  const [override, setOverride] = useState<"dark" | "light" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [osPrefersDark, setOsPrefersDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setOverride(stored === "light" || stored === "dark" ? stored : null);
    setOsPrefersDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolveTheme(osPrefersDark, override));
  }, [override, mounted, osPrefersDark]);

  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setOsPrefersDark(media.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mounted]);

  const setTheme = useCallback(
    (next: Theme) => {
      if (next === "system") {
        localStorage.removeItem(storageKey);
        setOverride(null);
      } else {
        const osDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if ((next === "dark") === osDark) {
          localStorage.removeItem(storageKey);
          setOverride(null);
        } else {
          localStorage.setItem(storageKey, next);
          setOverride(next);
        }
      }
    },
    [storageKey],
  );

  const theme: Theme = override ?? "system";
  const resolvedTheme = resolveTheme(osPrefersDark, override);

  return (
    <ThemeProviderContext value={{ theme, resolvedTheme, setTheme }}>
      <ScriptOnce>{getThemeScript(storageKey)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
