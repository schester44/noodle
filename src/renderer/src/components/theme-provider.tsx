import { useAppStore } from "@/stores/app-store";
import { createContext, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
};

const initialState: ThemeProviderState = {
  theme: "dark"
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useAppStore((state) => state.userSettings.theme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}
