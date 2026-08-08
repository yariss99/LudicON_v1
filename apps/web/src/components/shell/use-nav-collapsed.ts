import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "prima.shell.nav-collapsed";

function readStored(): boolean {
  try {
    return globalThis.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // Storage can be unavailable (private browsing, blocked storage). The
    // preference simply does not persist; the shell is unaffected.
    return false;
  }
}

export interface NavCollapsedState {
  collapsed: boolean;
  toggle: () => void;
}

/**
 * Whether the rail is showing labels, remembered between sessions.
 *
 * A teacher who works on a small laptop collapses the rail once and expects
 * it to stay that way. Storing the choice is the difference between a
 * preference and a fidget.
 */
export function useNavCollapsed(): NavCollapsedState {
  const [collapsed, setCollapsed] = useState<boolean>(readStored);

  useEffect(() => {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // See readStored — losing the preference is acceptable, throwing is not.
    }
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  return { collapsed, toggle };
}
