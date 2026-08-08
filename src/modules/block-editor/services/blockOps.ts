import { createId } from "../../../utils/id";
import { BlockRegistry } from "../registry/BlockRegistry";
import type { UniversalBlock, UniversalBlockType } from "../types";

export function sortBlocks(blocks: UniversalBlock[]): UniversalBlock[] {
  return [...blocks].sort((a, b) => a.order - b.order);
}

export function renumber(blocks: UniversalBlock[]): UniversalBlock[] {
  return sortBlocks(blocks).map((b, order) => ({ ...b, order }));
}

export function reorderBlocks(
  blocks: UniversalBlock[],
  fromIndex: number,
  toIndex: number,
): UniversalBlock[] {
  const sorted = sortBlocks(blocks);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sorted.length ||
    toIndex >= sorted.length ||
    fromIndex === toIndex
  ) {
    return sorted;
  }
  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return renumber(next);
}

export function duplicateBlock(
  blocks: UniversalBlock[],
  id: string,
): UniversalBlock[] {
  const sorted = sortBlocks(blocks);
  const index = sorted.findIndex((b) => b.id === id);
  if (index < 0) return sorted;
  const source = sorted[index];
  const copy: UniversalBlock = {
    ...structuredClone(source),
    id: createId("ublk"),
    title: `${source.title} (copy)`,
    order: index + 1,
  };
  const next = [...sorted];
  next.splice(index + 1, 0, copy);
  return renumber(next);
}

export function deleteBlock(
  blocks: UniversalBlock[],
  id: string,
): UniversalBlock[] {
  return renumber(blocks.filter((b) => b.id !== id));
}

export function addBlock(
  blocks: UniversalBlock[],
  type: UniversalBlockType | string,
): UniversalBlock[] {
  const sorted = sortBlocks(blocks);
  const block = BlockRegistry.createBlock(type, sorted.length);
  return renumber([...sorted, block]);
}

export function updateBlock(
  blocks: UniversalBlock[],
  id: string,
  patch: Partial<UniversalBlock>,
): UniversalBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch, id: b.id } : b));
}

export function moveBlock(
  blocks: UniversalBlock[],
  id: string,
  direction: -1 | 1,
): UniversalBlock[] {
  const sorted = sortBlocks(blocks);
  const index = sorted.findIndex((b) => b.id === id);
  if (index < 0) return sorted;
  return reorderBlocks(sorted, index, index + direction);
}

export function seedDefaultDocumentBlocks(): UniversalBlock[] {
  return renumber([
    BlockRegistry.createBlock("text", 0),
    BlockRegistry.createBlock("exercise", 1),
    BlockRegistry.createBlock("reflection", 2),
  ]);
}
