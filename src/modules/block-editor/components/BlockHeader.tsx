import type { DragEvent, ReactNode } from "react";
import { BlockRegistry } from "../registry/BlockRegistry";
import type { UniversalBlock } from "../types";
import { BlockToolbar } from "./BlockToolbar";

type Props = {
  block: UniversalBlock;
  index: number;
  total: number;
  onTitleChange: (title: string) => void;
  onToggleCollapse: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (id: string, index: number) => void;
  toolbarVisible?: boolean;
  children?: ReactNode;
};

export function BlockHeader({
  block,
  index,
  total,
  onTitleChange,
  onToggleCollapse,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  toolbarVisible,
  children,
}: Props) {
  const def = BlockRegistry.get(block.type);

  return (
    <div className="flex items-start gap-1 px-2 pt-2 sm:px-3 sm:pt-3">
      <button
        type="button"
        draggable
        onDragStart={(e: DragEvent) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart(block.id, index);
        }}
        className="mt-1 cursor-grab rounded-md px-1.5 py-1 text-slate-300 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
        title="Move"
      >
        ⋮⋮
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {def?.icon} {def?.label ?? block.type}
          </span>
          <input
            value={block.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="min-w-0 flex-1 border-none bg-transparent text-base font-semibold tracking-tight text-slate-900 outline-none"
            aria-label="Block title"
          />
          <BlockToolbar
            collapsed={block.collapsed}
            onToggleCollapse={onToggleCollapse}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < total - 1}
            visible={toolbarVisible}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
