import { useCallback, useEffect, useState } from "react";
import { DESK_LOAD_DELAY_MS, DESK_RETRY_DELAY_MS } from "../constants";
import type { DeskNetworkState } from "../types";

export function useDeskNetworkState(refresh: () => void) {
  const [networkState, setNetworkState] =
    useState<DeskNetworkState>("loading");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        refresh();
        setNetworkState("ready");
      } catch {
        setNetworkState("error");
      }
    }, DESK_LOAD_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refresh]);

  const retry = useCallback(() => {
    setNetworkState("loading");
    window.setTimeout(() => {
      try {
        refresh();
        setNetworkState("ready");
      } catch {
        setNetworkState("error");
      }
    }, DESK_RETRY_DELAY_MS);
  }, [refresh]);

  return { networkState, retry };
}
