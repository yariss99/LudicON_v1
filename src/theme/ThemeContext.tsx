import { createContext, useContext } from "react";
import type { AppTheme } from "./theme";

export type ThemeContextValue = {
  readonly theme: AppTheme;
  readonly setTheme: (theme: AppTheme) => void;
  readonly toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
