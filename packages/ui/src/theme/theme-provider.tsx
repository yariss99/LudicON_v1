import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "ludicon.theme";

type ThemeContextValue = {
  /** What the user chose. */
  preference: ThemePreference;
  /** What is actually rendered right now — `system` resolved against the OS. */
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
  if (typeof localStorage === "undefined") return "system";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" || raw === "system"
      ? raw
      : "system";
  } catch {
    // Private browsing / disabled storage. Falling back is correct here —
    // a theme preference is never worth breaking the app over.
    return "system";
  }
}

function prefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Applies the preference to <html>.
 *
 * `system` deliberately REMOVES the attribute rather than writing a resolved
 * value, so the `prefers-color-scheme` media query in tokens.css takes over.
 * That keeps the OS as the live source of truth without a JS round-trip on
 * every OS change.
 */
function applyPreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", preference);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(readStoredPreference);
  const [systemDark, setSystemDark] = useState<boolean>(prefersDark);

  useEffect(() => {
    applyPreference(preference);
  }, [preference]);

  // Track the OS setting so `resolved` stays accurate in system mode.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal; the choice simply won't survive a reload.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolved:
        preference === "system" ? (systemDark ? "dark" : "light") : preference,
      setPreference,
    }),
    [preference, systemDark, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return context;
}

/**
 * Blocking script that sets the theme attribute before first paint.
 *
 * Without this the page renders light, then flips — the classic theme flash.
 * Injected as a raw string so it runs synchronously in <head>.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${STORAGE_KEY}");if(p==="light"||p==="dark"){document.documentElement.setAttribute("data-theme",p);}}catch(e){}})();`;
