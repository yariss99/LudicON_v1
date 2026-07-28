import type { UpeBlockType, UpeEditorBlock } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function renumber(blocks: UpeEditorBlock[]): UpeEditorBlock[] {
  return blocks.map((b, index) => ({ ...b, order: index }));
}

export function sortBlocks(blocks: UpeEditorBlock[]): UpeEditorBlock[] {
  return [...blocks].sort((a, b) => a.order - b.order);
}

export function moveBlock(
  blocks: UpeEditorBlock[],
  blockId: string,
  direction: "up" | "down",
): UpeEditorBlock[] {
  const sorted = sortBlocks(blocks);
  const index = sorted.findIndex((b) => b.id === blockId);
  if (index < 0) return sorted;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= sorted.length) return sorted;
  if (sorted[index]?.locked) return sorted;
  const next = [...sorted];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return renumber(next);
}

export function duplicateBlock(
  blocks: UpeEditorBlock[],
  blockId: string,
): UpeEditorBlock[] {
  const sorted = sortBlocks(blocks);
  const index = sorted.findIndex((b) => b.id === blockId);
  if (index < 0) return sorted;
  const source = sorted[index];
  const clone: UpeEditorBlock = {
    ...structuredClone(source),
    id: uid("blk"),
    locked: false,
  };
  const next = [...sorted];
  next.splice(index + 1, 0, clone);
  return renumber(next);
}

export function setBlockLocked(
  blocks: UpeEditorBlock[],
  blockId: string,
  locked: boolean,
): UpeEditorBlock[] {
  return sortBlocks(blocks).map((b) =>
    b.id === blockId ? { ...b, locked } : b,
  );
}

export function setBlockVisibility(
  blocks: UpeEditorBlock[],
  blockId: string,
  visibility: UpeEditorBlock["visibility"],
): UpeEditorBlock[] {
  return sortBlocks(blocks).map((b) =>
    b.id === blockId && !b.locked ? { ...b, visibility } : b,
  );
}

export function deleteBlock(
  blocks: UpeEditorBlock[],
  blockId: string,
): UpeEditorBlock[] {
  return renumber(
    sortBlocks(blocks).filter((b) => b.id !== blockId || b.locked),
  );
}

export function convertBlockType(
  blocks: UpeEditorBlock[],
  blockId: string,
  nextType: UpeBlockType,
): UpeEditorBlock[] {
  return sortBlocks(blocks).map((b) => {
    if (b.id !== blockId || b.locked) return b;
    return {
      ...b,
      type: nextType,
      content: {
        ...b.content,
        convertedFrom: b.type,
      },
    };
  });
}

export function updateBlockContent(
  blocks: UpeEditorBlock[],
  blockId: string,
  patch: Record<string, unknown>,
): UpeEditorBlock[] {
  return sortBlocks(blocks).map((b) => {
    if (b.id !== blockId || b.locked) return b;
    return { ...b, content: { ...b.content, ...patch } };
  });
}

export function createBlock(
  type: UpeBlockType,
  order: number,
  content: Record<string, unknown> = {},
): UpeEditorBlock {
  return {
    id: uid("blk"),
    type,
    content: {
      text:
        type === "heading"
          ? "Titlu"
          : type === "exercise"
            ? "Enunțul exercițiului"
            : type === "teacher_note"
              ? "Notă pentru profesor"
              : "",
      ...content,
    },
    order,
    visibility: type === "teacher_note" ? "teacher" : "both",
    pedagogicalPurpose:
      type === "exercise" || type === "open_question" ? "practice" : undefined,
  };
}

export function insertBlock(
  blocks: UpeEditorBlock[],
  type: UpeBlockType,
  afterId?: string | null,
): UpeEditorBlock[] {
  const sorted = sortBlocks(blocks);
  const block = createBlock(type, sorted.length);
  if (!afterId) return renumber([...sorted, block]);
  const index = sorted.findIndex((b) => b.id === afterId);
  if (index < 0) return renumber([...sorted, block]);
  const next = [...sorted];
  next.splice(index + 1, 0, block);
  return renumber(next);
}
