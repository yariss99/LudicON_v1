import type { SaveStatus } from "../types";

/** Human labels matching Mission 006 copy. */
export function formatSaveStatus(
  status: SaveStatus,
  lastSavedAt: string | null,
  formatRelative?: (iso: string) => string,
): string {
  if (status === "saving") return "Saving...";
  if (status === "failed") return "Save failed";
  if (status === "dirty") return "Saving...";
  if (status === "saved" || status === "idle") {
    if (!lastSavedAt) return "Saved just now";
    if (formatRelative) {
      const relative = formatRelative(lastSavedAt);
      // Treat very recent as "just now"
      if (
        relative === "just now" ||
        relative === "Just now" ||
        relative === "acum" ||
        Date.now() - Date.parse(lastSavedAt) < 15_000
      ) {
        return "Saved just now";
      }
      return `Saved ${relative}`;
    }
    if (Date.now() - Date.parse(lastSavedAt) < 15_000) {
      return "Saved just now";
    }
    return "Saved just now";
  }
  return "Saved just now";
}
