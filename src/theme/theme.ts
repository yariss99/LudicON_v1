/**
 * LudicON appearance — Light and Dark.
 *
 * One document-level theme, applied through `--lx-*` tokens. Preference is
 * stored under the existing `prima.ui.*` localStorage convention so it
 * survives navigation and refresh without a new persistence layer.
 */

export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "prima.ui.theme";
export const DEFAULT_THEME: AppTheme = "light";

export function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

export function readStoredTheme(): AppTheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode / quota — appearance still applies for this session */
  }
}

export function applyTheme(theme: AppTheme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

export function readDocumentTheme(): AppTheme {
  const attr = document.documentElement.getAttribute("data-theme");
  return isAppTheme(attr) ? attr : readStoredTheme();
}
