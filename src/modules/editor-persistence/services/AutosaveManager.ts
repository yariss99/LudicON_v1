import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_SAFETY_INTERVAL_MS,
} from "../constants";
import type { SaveStatus } from "../types";

export type AutosaveManagerOptions<T> = {
  debounceMs?: number;
  safetyIntervalMs?: number;
  persist: (document: T) => T | Promise<T>;
  onStatus?: (status: SaveStatus, error?: Error) => void;
  onSaved?: (document: T) => void;
};

/**
 * AutosaveManager — debounced persist with safety interval + failure status.
 */
export class AutosaveManager<T> {
  private readonly debounceMs: number;
  private readonly safetyIntervalMs: number;
  private readonly persistFn: (document: T) => T | Promise<T>;
  private readonly onStatus?: (status: SaveStatus, error?: Error) => void;
  private readonly onSaved?: (document: T) => void;

  private pending: T | null = null;
  private dirty = false;
  private timer: number | null = null;
  private safetyTimer: number | null = null;
  private destroyed = false;
  private saving = false;

  constructor(options: AutosaveManagerOptions<T>) {
    this.debounceMs = options.debounceMs ?? AUTOSAVE_DEBOUNCE_MS;
    this.safetyIntervalMs =
      options.safetyIntervalMs ?? AUTOSAVE_SAFETY_INTERVAL_MS;
    this.persistFn = options.persist;
    this.onStatus = options.onStatus;
    this.onSaved = options.onSaved;
    this.safetyTimer = window.setInterval(() => {
      if (this.dirty) void this.flush();
    }, this.safetyIntervalMs);
  }

  markDirty(document: T): void {
    if (this.destroyed) return;
    this.pending = document;
    this.dirty = true;
    this.onStatus?.("dirty");
    if (this.timer != null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      void this.flush();
    }, this.debounceMs);
  }

  /** Replace pending document without resetting debounce (keeps timer). */
  updatePending(document: T): void {
    if (this.destroyed) return;
    this.pending = document;
    if (!this.dirty) {
      this.markDirty(document);
      return;
    }
    if (this.timer == null) {
      this.timer = window.setTimeout(() => {
        void this.flush();
      }, this.debounceMs);
    }
  }

  async flush(): Promise<T | null> {
    if (this.destroyed || !this.dirty || this.pending == null || this.saving) {
      return null;
    }
    if (this.timer != null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    const doc = this.pending;
    this.saving = true;
    this.onStatus?.("saving");
    try {
      const saved = await Promise.resolve(this.persistFn(doc));
      this.dirty = false;
      this.pending = saved;
      this.saving = false;
      this.onStatus?.("saved");
      this.onSaved?.(saved);
      return saved;
    } catch (err) {
      this.saving = false;
      const error = err instanceof Error ? err : new Error(String(err));
      this.onStatus?.("failed", error);
      return null;
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.timer != null) window.clearTimeout(this.timer);
    if (this.safetyTimer != null) window.clearInterval(this.safetyTimer);
    this.timer = null;
    this.safetyTimer = null;
  }
}
