import { DRAFT_STORAGE_PREFIX } from "../constants";
import type { DraftRecord, EditorResourceType } from "../types";

function draftKey(resourceType: EditorResourceType, resourceId: string) {
  return `${DRAFT_STORAGE_PREFIX}:${resourceType}:${resourceId}`;
}

/**
 * DraftManager — LocalStorage drafts for crash-safe unfinished work.
 */
export class DraftManager<TSnapshot> {
  readonly resourceType: EditorResourceType;
  readonly resourceId: string;

  constructor(resourceType: EditorResourceType, resourceId: string) {
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  private key() {
    return draftKey(this.resourceType, this.resourceId);
  }

  saveDraft(snapshot: TSnapshot): DraftRecord<TSnapshot> {
    const record: DraftRecord<TSnapshot> = {
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      updatedAt: new Date().toISOString(),
      snapshot: structuredClone(snapshot),
    };
    try {
      localStorage.setItem(this.key(), JSON.stringify(record));
    } catch {
      // Quota / private mode — drafts are best-effort.
    }
    return record;
  }

  loadDraft(): DraftRecord<TSnapshot> | null {
    try {
      const raw = localStorage.getItem(this.key());
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DraftRecord<TSnapshot>;
      if (
        !parsed ||
        parsed.resourceType !== this.resourceType ||
        parsed.resourceId !== this.resourceId ||
        !parsed.snapshot
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    try {
      localStorage.removeItem(this.key());
    } catch {
      /* ignore */
    }
  }

  /** True when a draft exists and is newer than the last persisted document. */
  hasUnfinishedDraft(persistedUpdatedAt: string | null | undefined): boolean {
    const draft = this.loadDraft();
    if (!draft) return false;
    if (!persistedUpdatedAt) return true;
    return Date.parse(draft.updatedAt) > Date.parse(persistedUpdatedAt);
  }
}
