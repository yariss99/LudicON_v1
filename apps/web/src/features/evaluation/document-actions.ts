import {
  addBlock,
  addPage,
  addSection,
  columnParent,
  findSectionOfColumn,
  locateBlock,
  moveBlock,
  moveSection,
  pageOfSection,
  removeBlock,
  removePage,
  removeSection,
  restoreBlocks,
  restoreSection,
  sameParent,
  sectionsOfPage,
  setMeta,
  setTheme,
  updateBlock,
  updatePage,
  updateSection,
  type Block,
  type BlockId,
  type BlockParent,
  type EvaluationProject,
  type Page,
  type PageId,
  type Section,
  type SectionId,
  type SectionLayout,
  type Theme,
} from "@ludicon/evaluation";

import {
  cloneSection,
  cloneSubtree,
  newBlock,
  newPage,
  newSection,
  type PieceKind,
} from "./block-factory";
import {
  openPage,
  resolveSelection,
  runCommand,
  select,
  settleCurrentPage,
  type EditorSelection,
  type EditorState,
  type EditorStore,
} from "./editor-store";

/**
 * The gestures the builder offers, each expressed as one command.
 *
 * This module exists so that no component builds a command itself. A button
 * that assembled `moveBlock(parent, i, parent, i - 1)` inline would have to
 * know how a block is addressed — and there are two kinds of container, so it
 * would get the free-frame case wrong the first time it met one. Here the
 * addressing is worked out once, from the document, and every caller passes
 * only what the teacher actually expressed: a direction, a kind, a layout.
 *
 * Each function is a single history step. That is the unit the teacher will
 * press ⌘Z against, so anything they experienced as one action — change a
 * layout and rebuild its columns — has to be one command, never two.
 */

/**
 * Where a new piece lands.
 *
 * Reading order, and only reading order: after the selected piece if there is
 * one, at the end of the selected row otherwise, and at the end of the current
 * page's last row when nothing is selected. The rejected alternative was
 * "always append to the page", which is correct exactly once and then puts
 * every subsequent piece at the bottom of a paper the teacher is editing in the
 * middle.
 */
const insertionPoint = (
  state: EditorState,
): { parent: BlockParent; index: number } | null => {
  const { document } = state;
  const resolved = resolveSelection(state.document, state.selection);

  if (resolved?.kind === "block") {
    const location = locateBlock(document, resolved.id);
    if (location) {
      return { parent: location.parent, index: location.index + 1 };
    }
  }

  const section =
    resolved?.kind === "section"
      ? document.sections[resolved.id]
      : lastSectionOfCurrentPage(state);

  const column = section?.columns[0];
  if (!column) return null;

  return {
    parent: columnParent(column.id),
    index: column.blockOrder.length,
  };
};

const lastSectionOfCurrentPage = (state: EditorState): Section | undefined => {
  const page = state.document.pages[state.currentPageId];
  if (!page) return undefined;
  return sectionsOfPage(state.document, page).at(-1);
};

/**
 * Adds a piece and selects it.
 *
 * Selecting is part of the same gesture rather than a courtesy: an empty
 * paragraph is invisible on the page, so a teacher who added one and saw
 * nothing change would reasonably press the button again.
 */
export const addPiece = (store: EditorStore, kind: PieceKind): void => {
  const target = insertionPoint(store.state);
  if (!target) return;

  const block = newBlock(kind);
  runCommand(store, addBlock(target.parent, target.index, block));
  select(store, block.id);
};

export const addRow = (store: EditorStore, layout: SectionLayout): void => {
  const state = store.state;
  const page = state.document.pages[state.currentPageId];
  if (!page) return;

  const section = newSection(layout);
  runCommand(store, addSection(page.id, page.sectionOrder.length, section));
  select(store, section.id);
};

/** Replaces a piece wholesale — the model has no partial patch, on purpose. */
export const replaceBlock = (store: EditorStore, block: Block): void => {
  runCommand(store, updateBlock(block));
};

export const replaceSection = (store: EditorStore, section: Section): void => {
  runCommand(store, updateSection(section));
};

/**
 * Moves the selected piece one place up or down inside its own container.
 *
 * Within the container only. Carrying a block across a column boundary when it
 * reaches the end reads as teleportation on a page with three columns, and the
 * teacher has no way to predict which column it will land in.
 */
export const moveSelectedBlock = (
  store: EditorStore,
  direction: -1 | 1,
): void => {
  const state = store.state;
  const resolved = resolveSelection(state.document, state.selection);
  if (resolved?.kind !== "block") return;

  const location = locateBlock(state.document, resolved.id);
  if (!location) return;

  const to = location.index + direction;
  if (to < 0) return;

  runCommand(
    store,
    moveBlock(location.parent, location.index, location.parent, to),
  );
};

export const moveSelectedSection = (
  store: EditorStore,
  direction: -1 | 1,
): void => {
  const state = store.state;
  const resolved = resolveSelection(state.document, state.selection);
  if (resolved?.kind !== "section") return;

  const page = pageOfSectionId(state.document, resolved.id);
  if (!page) return;

  const index = page.sectionOrder.indexOf(resolved.id);
  const to = index + direction;
  if (index < 0 || to < 0 || to >= page.sectionOrder.length) return;

  runCommand(store, moveSection(page.id, index, page.id, to));
};

const pageOfSectionId = (
  document: EvaluationProject,
  sectionId: Section["id"],
) =>
  document.pageOrder
    .map((pageId) => document.pages[pageId])
    .find((page) => page?.sectionOrder.includes(sectionId));

/** Whether the selected piece can still travel in that direction. */
export const canMoveSelection = (
  state: EditorState,
  direction: -1 | 1,
): boolean => {
  const resolved = resolveSelection(state.document, state.selection);

  if (resolved?.kind === "block") {
    const location = locateBlock(state.document, resolved.id);
    if (!location) return false;
    const parentOrder = orderLength(state.document, location.parent);
    const to = location.index + direction;
    return to >= 0 && to < parentOrder;
  }

  if (resolved?.kind === "section") {
    const page = pageOfSectionId(state.document, resolved.id);
    if (!page) return false;
    const to = page.sectionOrder.indexOf(resolved.id) + direction;
    return to >= 0 && to < page.sectionOrder.length;
  }

  return false;
};

const orderLength = (
  document: EvaluationProject,
  parent: BlockParent,
): number => {
  if (parent.kind === "free") {
    const frame = document.blocks[parent.blockId];
    return frame && frame.kind === "free" ? frame.blockOrder.length : 0;
  }
  for (const section of Object.values(document.sections)) {
    const column = section.columns.find((one) => one.id === parent.columnId);
    if (column) return column.blockOrder.length;
  }
  return 0;
};

export const removeSelected = (store: EditorStore): void => {
  const resolved = resolveSelection(
    store.state.document,
    store.state.selection,
  );
  if (!resolved) return;

  if (resolved.kind === "block") runCommand(store, removeBlock(resolved.id));
  if (resolved.kind === "section")
    runCommand(store, removeSection(resolved.id));
  if (resolved.kind === "page") runCommand(store, removePage(resolved.id));

  select(store, null);
  settleCurrentPage(store);
};

/**
 * The selection again, one place further down its own container.
 *
 * The copy is built by `cloneSubtree`/`cloneSection` and inserted by
 * `restoreBlocks`/`restoreSection` — the commands undo already uses to put a
 * removed subtree back. That reuse is the point: those are the only commands
 * that carry blocks AND their answer-key entries in a single step, so one press
 * of undo takes back the whole copy, including a duplicated exercise's barem.
 * Building it from `addBlock` instead would insert the root and silently drop a
 * frame's children, because `addBlock` inserts exactly one block.
 *
 * It lands at `index + 1`, not at the end. A copy is made to be edited next to
 * the thing it came from; sending it to the bottom of a column means the
 * teacher's next act is always a move.
 *
 * The clone is then selected, so the toolbar keeps addressing the piece the
 * teacher is looking at. Leaving the original selected would make a second
 * press duplicate the original again rather than continue the copy.
 *
 * Pages are not duplicated here. A page copy is a different command — every
 * section and every block on it, plus the page's own background — and
 * `EVALUATION_COPY.duplicatePage` is still unused because of it.
 */
export const duplicateSelected = (store: EditorStore): void => {
  const document = store.state.document;
  const resolved = resolveSelection(document, store.state.selection);
  if (!resolved) return;

  if (resolved.kind === "block") {
    const location = locateBlock(document, resolved.id);
    const cloned = cloneSubtree(document, resolved.id);
    if (!location || !cloned) return;

    runCommand(
      store,
      restoreBlocks(
        location.parent,
        location.index + 1,
        cloned.rootId,
        cloned.blocks,
        cloned.answers,
      ),
    );
    select(store, cloned.rootId);
    return;
  }

  if (resolved.kind === "section") {
    const section = document.sections[resolved.id];
    const page = pageOfSection(document, resolved.id);
    if (!section || !page) return;

    const index = page.sectionOrder.indexOf(resolved.id);
    if (index < 0) return;

    const cloned = cloneSection(document, section);
    runCommand(
      store,
      restoreSection(
        page.id,
        index + 1,
        cloned.section,
        cloned.blocks,
        cloned.answers,
      ),
    );
    select(store, cloned.section.id);
  }
};

/** Whether the selection is a kind that can be copied. Pages cannot, yet. */
export const canDuplicateSelection = (
  document: EvaluationProject,
  selection: EditorSelection,
): boolean => {
  const resolved = resolveSelection(document, selection);
  return resolved !== null && resolved.kind !== "page";
};

/**
 * Adds a sheet at the end and opens it.
 *
 * The page and its first row arrive together, in one command, so that undo
 * takes back "adaugă o pagină" rather than leaving a page with nothing on it
 * that the teacher then has to remove separately.
 */
export const addSheet = (store: EditorStore): void => {
  const { page, section } = newPage();
  runCommand(
    store,
    addPage(store.state.document.pageOrder.length, page, {
      [section.id]: section,
    }),
  );
  openPage(store, page.id);
};

export const removeSheet = (store: EditorStore, pageId: PageId): void => {
  runCommand(store, removePage(pageId));
  select(store, null);
  settleCurrentPage(store);
};

/** Renames the paper. The heading on the cover is the teacher's, and stays. */
export const renamePaper = (store: EditorStore, title: string): void => {
  if (store.state.document.meta.title === title) return;
  runCommand(store, setMeta({ title }));
};

/**
 * Swaps the whole token set.
 *
 * The theme is replaced entire rather than patched, which is what `setTheme`
 * takes and what makes its inverse the previous theme unchanged. Every control
 * in the theme panel therefore builds a full `Theme` from the current one and
 * hands it here — one field changed, one command, one press of ⌘Z.
 */
export const applyTheme = (store: EditorStore, theme: Theme): void => {
  runCommand(store, setTheme(theme));
};

/**
 * Replaces one sheet's own settings — its background and whether it permits
 * free placement.
 *
 * `sectionOrder` travels with the page, so callers must spread the CURRENT page
 * rather than assembling a fresh one; `updatePage` says the same thing from the
 * other side. Building a page here from parts would drop whatever landed on it
 * between the panel rendering and the teacher pressing.
 */
export const applyPageSettings = (store: EditorStore, page: Page): void => {
  runCommand(store, updatePage(page));
};

/**
 * A dropped piece, expressed as the move it always was.
 *
 * Drag adds no way to change the document. It computes a destination and calls
 * `moveBlock`, exactly as the up/down buttons do — which is the whole reason
 * undo needs nothing new to reverse a drag, and why a drag and a button press
 * are indistinguishable in the history.
 *
 * ## The seam index is not the array index
 *
 * A seam is a GAP: seam `k` means "before whatever is currently at `k`". A
 * container with three pieces has four seams. `moveBlock` is "detach, then
 * insert", so within one container everything after the piece has already
 * shifted left by the time the insert happens, and inserting at `k` would land
 * the piece one place too far down. Subtracting one in that case is the whole
 * of the arithmetic, and it is here rather than in the drag layer so the drag
 * layer can stay a thing that reports where the pointer is.
 *
 * The two seams touching the piece are refused. Dropping something back exactly
 * where it came from is a gesture a teacher makes constantly — they change
 * their mind mid-drag — and recording it would put a step in the history that
 * takes a press of ⌘Z to undo and visibly does nothing.
 */
export const dropBlock = (
  store: EditorStore,
  blockId: BlockId,
  parent: BlockParent,
  seamIndex: number,
): void => {
  const { document } = store.state;
  const location = locateBlock(document, blockId);
  if (!location) return;

  const home = sameParent(location.parent, parent);
  if (
    home &&
    (seamIndex === location.index || seamIndex === location.index + 1)
  )
    return;

  const toIndex =
    home && location.index < seamIndex ? seamIndex - 1 : seamIndex;
  runCommand(
    store,
    moveBlock(location.parent, location.index, parent, toIndex),
  );

  /**
   * The sheet the piece landed on becomes the current one, before the piece is
   * chosen. In that order, because `openPage` clears the selection when the
   * sheet changes — the same trap `use-canvas-roving.ts` documents.
   */
  const landed = pageOfParent(store.state.document, parent);
  if (landed) openPage(store, landed.id);
  select(store, blockId);
};

/**
 * A piece dragged out of the library and let go over a seam.
 *
 * One `addBlock`, through `runCommand`, so one press of ⌘Z removes the piece
 * that was just dropped — the same single step the library's own buttons record
 * through `addPiece`. Drag adds a second way to INVOKE that command and no new
 * way to change the document, which is what keeps the history honest.
 *
 * ## The seam index is the array index here, and is not in `dropBlock`
 *
 * That difference is the whole reason this is a separate function rather than a
 * flag on the one above. `moveBlock` is "detach, then insert", so within one
 * container everything after the piece has already shifted by the time the
 * insert happens and one has to be subtracted. Nothing is detached here: the
 * piece does not exist yet, so seam `k` — "before whatever is at `k`" — is
 * exactly the index `addBlock` inserts at. Sharing the arithmetic would have
 * meant a branch inside it saying "unless there is no source", which is the
 * same two functions with the seam between them hidden.
 *
 * The piece is selected afterwards for the same reason `addPiece` selects: an
 * empty paragraph draws nothing, so a teacher who dropped one and saw no change
 * would reasonably drop another.
 */
export const dropNewPiece = (
  store: EditorStore,
  kind: PieceKind,
  parent: BlockParent,
  seamIndex: number,
): void => {
  const block = newBlock(kind);
  runCommand(store, addBlock(parent, seamIndex, block));

  const landed = pageOfParent(store.state.document, parent);
  if (landed) openPage(store, landed.id);
  select(store, block.id);
};

/** The same, one rank up: a row dragged out of the library onto a sheet. */
export const dropNewRow = (
  store: EditorStore,
  layout: SectionLayout,
  pageId: PageId,
  seamIndex: number,
): void => {
  const section = newSection(layout);
  runCommand(store, addSection(pageId, seamIndex, section));

  openPage(store, pageId);
  select(store, section.id);
};

/** Which sheet a container sits on, for the two callers that need to open it. */
const pageOfParent = (
  document: EvaluationProject,
  parent: BlockParent,
): Page | undefined => {
  const section =
    parent.kind === "column"
      ? findSectionOfColumn(document, parent.columnId)
      : undefined;
  return section ? pageOfSection(document, section.id) : undefined;
};

/**
 * A dropped row. Same shape as `dropBlock`, against `moveSection`.
 *
 * Kept separate rather than generalised over "thing with an order array": the
 * two commands take different addresses — a block's container is a union, a
 * row's is always a page — and a wrapper that hid that would have to reconstruct
 * it at the call site anyway.
 */
export const dropSection = (
  store: EditorStore,
  sectionId: SectionId,
  pageId: PageId,
  seamIndex: number,
): void => {
  const { document } = store.state;
  const from = pageOfSection(document, sectionId);
  if (!from) return;

  const fromIndex = from.sectionOrder.indexOf(sectionId);
  if (fromIndex < 0) return;

  const home = from.id === pageId;
  if (home && (seamIndex === fromIndex || seamIndex === fromIndex + 1)) return;

  const toIndex = home && fromIndex < seamIndex ? seamIndex - 1 : seamIndex;
  runCommand(store, moveSection(from.id, fromIndex, pageId, toIndex));

  openPage(store, pageId);
  select(store, sectionId);
};
