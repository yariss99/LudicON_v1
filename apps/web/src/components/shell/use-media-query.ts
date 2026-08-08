import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a CSS media query from React.
 *
 * The rail is a different component below 1024px than above it — a fixed icon
 * rail rather than one the teacher controls — and that is a structural
 * decision, not something a utility class can express. `useSyncExternalStore`
 * rather than `useEffect` so the first paint is already correct: CH08 says
 * content must never jump when panels change, and a one-frame wide rail that
 * snaps narrow is exactly that jump.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => {
        list.removeEventListener("change", onStoreChange);
      };
    },
    [query],
  );

  const getSnapshot = useCallback(
    () =>
      typeof window === "undefined" ? false : window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** CH08 §5 canonical breakpoints, as queries. */
export const LAPTOP_UP = "(min-width: 1024px)";
export const TABLET_LG_UP = "(min-width: 900px)";
