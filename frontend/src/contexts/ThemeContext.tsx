"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type ThemeSource = "system" | "user";

type ThemeContextType = {
  theme: Theme;
  themeSource: ThemeSource;
  toggleTheme: () => void;
  useSystemTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const resolveSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialTheme = (): { theme: Theme; source: ThemeSource } => {
  if (typeof window === "undefined") {
    return { theme: "light", source: "system" };
  }

  const storedSource = window.localStorage.getItem("theme-source") as ThemeSource | null;
  const storedTheme = window.localStorage.getItem("theme") as Theme | null;

  if (storedSource === "user" && (storedTheme === "light" || storedTheme === "dark")) {
    return { theme: storedTheme, source: "user" };
  }

  const systemTheme = resolveSystemTheme();
  if (storedTheme === "light" || storedTheme === "dark") {
    return { theme: storedTheme, source: storedSource === "system" ? "system" : "user" };
  }

  return { theme: systemTheme, source: "system" };
};

const applyThemeClass = (theme: Theme) => {
  if (typeof window === "undefined") {
    return;
  }

  const root = window.document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ theme: Theme; source: ThemeSource }>(() => getInitialTheme());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      if (state.source === "system") {
        const nextTheme = event.matches ? "dark" : "light";
        setState((prev) => ({ ...prev, theme: nextTheme }));
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [state.source]);

  useEffect(() => {
    applyThemeClass(state.theme);

    if (typeof window === "undefined") {
      return;
    }

    if (state.source === "user") {
      window.localStorage.setItem("theme", state.theme);
    } else {
      window.localStorage.removeItem("theme");
    }
    window.localStorage.setItem("theme-source", state.source);
  }, [state]);

  const toggleTheme = () => {
    setState((prev) => ({
      theme: prev.theme === "light" ? "dark" : "light",
      source: "user",
    }));
  };

  const useSystemTheme = () => {
    setState({ theme: resolveSystemTheme(), source: "system" });
  };

  const value = useMemo(
    () => ({
      theme: state.theme,
      themeSource: state.source,
      toggleTheme,
      useSystemTheme,
    }),
    [state.theme, state.source]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
