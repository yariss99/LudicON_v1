import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the page has moved off its top.
 *
 * Read as an external store rather than as state in an effect, so the very
 * first paint is already correct. A dock that mounts flat and then lifts one
 * frame later is a flicker on every route change, and the reader has no idea
 * why the shadow blinked.
 *
 * The snapshot is a boolean, which is what makes this safe: `useSyncExternalStore`
 * bails out when the value is unchanged, so a scroll of six hundred pixels
 * re-renders the dock exactly once — on the frame it crosses the threshold.
 *
 * The listener is passive, so it can never delay a scroll.
 */
export function useScrolled(threshold = 8): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    globalThis.addEventListener("scroll", onStoreChange, { passive: true });
    return () => {
      globalThis.removeEventListener("scroll", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(
    () => globalThis.scrollY > threshold,
    [threshold],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
