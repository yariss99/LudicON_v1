import { useEffect, useState } from "react";
import type { BlueprintPanelLayoutMode } from "../types";

/**
 * Desktop sticky · tablet collapsible · mobile drawer
 */
export function useBlueprintPanelLayout(): BlueprintPanelLayoutMode {
  const [layout, setLayout] = useState<BlueprintPanelLayoutMode>(() => {
    if (typeof window === "undefined") return "sticky";
    return resolveLayout(window.innerWidth);
  });

  useEffect(() => {
    const onResize = () => setLayout(resolveLayout(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return layout;
}

function resolveLayout(width: number): BlueprintPanelLayoutMode {
  if (width >= 1024) return "sticky";
  if (width >= 768) return "collapsible";
  return "drawer";
}
