import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (nextTheme: Theme, persist = false) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme = nextTheme;

  if (persist) {
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Ignore storage failures; the visual theme should still update.
    }
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // App defaults to light mode. Server and first client render match to
  // avoid hydration mismatch; client effect applies any stored override.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      const value = localStorage.getItem("theme");
      stored = value === "light" || value === "dark" ? value : null;
    } catch {
      stored = null;
    }

    const nextTheme = stored ?? "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme, true);
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "light" as Theme, toggleTheme: () => {} };
  return ctx;
};
