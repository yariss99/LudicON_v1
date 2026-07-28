import type { AssetTypeId, QueueItem, RegenerationScope } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * QueueManager — multi-asset queue; items run independently.
 */
export const queueManager = {
  enqueue(
    queue: QueueItem[],
    assetTypeId: AssetTypeId,
    scope: RegenerationScope = "entire_asset",
    scopeTarget?: string,
  ): QueueItem[] {
    if (
      queue.some(
        (item) =>
          item.assetTypeId === assetTypeId &&
          (item.status === "queued" || item.status === "generating"),
      )
    ) {
      return queue;
    }

    const item: QueueItem = {
      id: uid("gq"),
      assetTypeId,
      scope,
      scopeTarget,
      enqueuedAt: new Date().toISOString(),
      startedAt: null,
      status: "queued",
    };
    return [...queue, item];
  },

  next(queue: QueueItem[]): QueueItem | null {
    return queue.find((item) => item.status === "queued") ?? null;
  },

  markGenerating(queue: QueueItem[], id: string): QueueItem[] {
    return queue.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "generating" as const,
            startedAt: new Date().toISOString(),
          }
        : item,
    );
  },

  markDone(
    queue: QueueItem[],
    id: string,
    status: "completed" | "failed",
  ): QueueItem[] {
    return queue.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
  },

  active(queue: QueueItem[]): QueueItem[] {
    return queue.filter(
      (item) => item.status === "queued" || item.status === "generating",
    );
  },
};
