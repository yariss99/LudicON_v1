import { createId } from "../../../utils/id";
import { MAX_UNDO_STACK, MAX_VERSIONS, VERSION_STORAGE_KEY } from "../constants";
import {
  HISTORY_ACTION_LABEL,
  type EditorResourceType,
  type HistoryAction,
  type VersionEntry,
} from "../types";

type VersionStore = Record<string, VersionEntry[]>;

function resourceKey(resourceType: EditorResourceType, resourceId: string) {
  return `${resourceType}:${resourceId}`;
}

function readStore(): VersionStore {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VersionStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: VersionStore) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota — best effort */
  }
}

/**
 * HistoryManager — in-memory undo/redo + persisted version timeline.
 */
export class HistoryManager<TSnapshot> {
  readonly resourceType: EditorResourceType;
  readonly resourceId: string;
  private past: TSnapshot[] = [];
  private future: TSnapshot[] = [];
  private listeners = new Set<() => void>();

  constructor(resourceType: EditorResourceType, resourceId: string) {
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l();
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  /** Push previous document onto undo stack before applying an edit. */
  pushUndo(previous: TSnapshot): void {
    this.past = [...this.past.slice(-(MAX_UNDO_STACK - 1)), structuredClone(previous)];
    this.future = [];
    this.notify();
  }

  undo(current: TSnapshot): TSnapshot | null {
    if (this.past.length === 0) return null;
    const previous = this.past[this.past.length - 1]!;
    this.past = this.past.slice(0, -1);
    this.future = [structuredClone(current), ...this.future].slice(0, MAX_UNDO_STACK);
    this.notify();
    return structuredClone(previous);
  }

  redo(current: TSnapshot): TSnapshot | null {
    if (this.future.length === 0) return null;
    const next = this.future[0]!;
    this.future = this.future.slice(1);
    this.past = [...this.past, structuredClone(current)].slice(-MAX_UNDO_STACK);
    this.notify();
    return structuredClone(next);
  }

  clearStacks(): void {
    this.past = [];
    this.future = [];
    this.notify();
  }

  private listKey() {
    return resourceKey(this.resourceType, this.resourceId);
  }

  listVersions(): VersionEntry<TSnapshot>[] {
    const store = readStore();
    const list = store[this.listKey()] ?? [];
    return list as VersionEntry<TSnapshot>[];
  }

  pushVersion(
    snapshot: TSnapshot,
    action: HistoryAction,
    label?: string,
  ): VersionEntry<TSnapshot> {
    const entry: VersionEntry<TSnapshot> = {
      id: createId("ver"),
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      timestamp: new Date().toISOString(),
      action,
      label: label ?? HISTORY_ACTION_LABEL[action],
      snapshot: structuredClone(snapshot),
    };
    const store = readStore();
    const key = this.listKey();
    const next = [entry, ...(store[key] ?? [])].slice(0, MAX_VERSIONS);
    store[key] = next;
    writeStore(store);
    this.notify();
    return entry;
  }

  getVersion(versionId: string): VersionEntry<TSnapshot> | null {
    return this.listVersions().find((v) => v.id === versionId) ?? null;
  }

  restoreSnapshot(versionId: string): TSnapshot | null {
    const entry = this.getVersion(versionId);
    if (!entry) return null;
    return structuredClone(entry.snapshot);
  }
}
