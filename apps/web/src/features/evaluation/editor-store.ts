import { Store } from "@tanstack/store";
import {
  applyCommand,
  canRedo,
  canUndo,
  createHistory,
  redo,
  undo,
  type BlockId,
  type Command,
  type EvaluationProject,
  type History,
  type PageId,
  type SectionId,
} from "@ludicon/evaluation";

/**
 * The whole editor, in one store.
 *
 * `@tanstack/store` rather than React state, for one reason that matters: the
 * document is read by the canvas, the pages rail, the toolbar, the inspector
 * and the autosave timer, and four of those five care about different slices of
 * it. Lifting it into `useState` on the builder screen would re-render every
 * one of them on every keystroke; a store lets each subscribe through
 * `useSelector` to the slice it actually shows. Context alone has the same
 * problem as state — the value changes, so every consumer re-renders.
 *
 * There is exactly one store per open paper and it is created by the route, not
 * at module scope. A module-level singleton would survive navigation between
 * two papers and hand the second one the first one's undo history.
 *
 * Nothing here mutates the document. Every change is a `Command` from
 * `@ludicon/evaluation` applied through `applyCommand`, which is what makes
 * undo the foundation rather than a later retrofit — see that package's
 * `commands/types.ts`. A setter that wrote a field directly would be invisible
 * to the history and would silently break every undo taken after it.
 *
 * That last paragraph used to be a promise this file could not keep.
 * `Store.setState` is public, so every component holding the store — nine of
 * them do — could have replaced `document` wholesale, and the history would have
 * gone on describing a document that no longer existed. Undo would then not
 * fail: it would quietly apply an inverse against the wrong state and produce a
 * plausible, wrong paper. `EditorStore` below is therefore the store MINUS its
 * setter, and the only writes are the six functions in this file.
 */

/**
 * What is selected, as a bare id.
 *
 * Three branded string types in a union rather than a tagged object. The brands
 * already make the three unconfusable at compile time, and the document is
 * normalised, so "which kind is this?" is one record lookup — see
 * `resolveSelection`. A tagged wrapper would carry a `kind` that can disagree
 * with the id it wraps, which is a state the lookup cannot produce.
 */
export type EditorSelection = BlockId | SectionId | PageId | null;

export interface EditorState {
  readonly document: EvaluationProject;
  readonly history: History;
  readonly selection: EditorSelection;
  /** Which sheet the rail highlights and new pieces are added to. */
  readonly currentPageId: PageId;
}

/**
 * The store, minus the door.
 *
 * `Omit<…, "setState">` and not a wrapper class: everything the readers need —
 * `state`, `get`, `subscribe` — keeps working untouched, so `useSelector`,
 * `createStoreContext` and every `store.state` in the builder compile exactly as
 * before, while the one member that could bypass the command layer is not on the
 * type. A wrapper would have meant re-exporting three methods by hand and
 * changing every call site in the canvas to match.
 */
export type EditorStore = Omit<Store<EditorState>, "setState">;

/**
 * The way back to the setter, for this module only.
 *
 * A `WeakMap` rather than a cast. A cast would be one line and would also be a
 * lie that any other file could repeat — `(store as Store<EditorState>)` is
 * available to anyone who imports the type. Membership of this map is granted by
 * `createEditorStore` and by nothing else, so "may write" is a fact about how
 * the store was made rather than about how hard someone is willing to squint at
 * the type. It is weak so a closed paper's store is still collectable.
 */
const writable = new WeakMap<EditorStore, Store<EditorState>>();

const write = (
  store: EditorStore,
  updater: (state: EditorState) => EditorState,
): void => {
  const target = writable.get(store);
  if (target === undefined) {
    throw new Error("Editorul a primit un obiect care nu este magazinul lui.");
  }
  target.setState(updater);
};

/**
 * Selection resolved against the document.
 *
 * Returns `null` for an id that no longer names anything, which happens
 * legitimately: undoing an insert removes the block that was selected, and the
 * selection is stale for exactly one render. Clearing it inside the command
 * path was the rejected alternative — it would make `applyCommand` depend on
 * what the user had clicked.
 */
export type ResolvedSelection =
  | { readonly kind: "block"; readonly id: BlockId }
  | { readonly kind: "section"; readonly id: SectionId }
  | { readonly kind: "page"; readonly id: PageId }
  | null;

export const resolveSelection = (
  document: EvaluationProject,
  selection: EditorSelection,
): ResolvedSelection => {
  if (selection === null) return null;
  if (document.blocks[selection as BlockId]) {
    return { kind: "block", id: selection as BlockId };
  }
  if (document.sections[selection as SectionId]) {
    return { kind: "section", id: selection as SectionId };
  }
  if (document.pages[selection as PageId]) {
    return { kind: "page", id: selection as PageId };
  }
  return null;
};

/**
 * The first page in print order.
 *
 * `pageOrder[0]` rather than `Object.keys(pages)[0]`: the order array is the
 * single source of truth for "which page is page 1", and record key order is
 * whatever the JSON parser happened to produce.
 */
const firstPageId = (document: EvaluationProject): PageId => {
  const first = document.pageOrder[0];
  if (first === undefined) {
    throw new Error(
      "Un proiect de evaluare are întotdeauna cel puțin o pagină.",
    );
  }
  return first;
};

export const createEditorStore = (document: EvaluationProject): EditorStore => {
  const store = new Store<EditorState>({
    document,
    history: createHistory(),
    selection: null,
    currentPageId: firstPageId(document),
  });

  writable.set(store, store);
  return store;
};

/**
 * Applies one command and records its inverse.
 *
 * The only path that changes the document. `apply` is total — a command aimed at
 * something that has since been removed returns the document unchanged — so this
 * never needs a guard of its own.
 */
export const runCommand = (store: EditorStore, command: Command): void => {
  write(store, (state) => {
    const next = applyCommand(
      { document: state.document, history: state.history },
      command,
    );
    return { ...state, document: next.document, history: next.history };
  });
};

export const undoEdit = (store: EditorStore): void => {
  write(store, (state) => {
    if (!canUndo(state.history)) return state;
    const next = undo({ document: state.document, history: state.history });
    return { ...state, document: next.document, history: next.history };
  });
};

export const redoEdit = (store: EditorStore): void => {
  write(store, (state) => {
    if (!canRedo(state.history)) return state;
    const next = redo({ document: state.document, history: state.history });
    return { ...state, document: next.document, history: next.history };
  });
};

export const select = (
  store: EditorStore,
  selection: EditorSelection,
): void => {
  write(store, (state) =>
    state.selection === selection ? state : { ...state, selection },
  );
};

/**
 * Opens a page and clears the selection.
 *
 * Clearing is deliberate: the selection outline is drawn over a page the
 * teacher has just scrolled away from, and leaving it would put a toolbar on
 * screen pointing at nothing.
 */
export const openPage = (store: EditorStore, pageId: PageId): void => {
  write(store, (state) =>
    state.currentPageId === pageId
      ? state
      : { ...state, currentPageId: pageId, selection: null },
  );
};

/** Keeps `currentPageId` on a page that still exists, after a removal or undo. */
export const settleCurrentPage = (store: EditorStore): void => {
  write(store, (state) =>
    state.document.pages[state.currentPageId]
      ? state
      : { ...state, currentPageId: firstPageId(state.document) },
  );
};
