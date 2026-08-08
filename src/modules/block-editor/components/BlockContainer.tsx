import { useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import type { UniversalBlock } from "../types";
import { useBlockEditor } from "../hooks/useBlockEditor";
import { BlockHeader } from "./BlockHeader";
import { BlockBody } from "./BlockBody";
import {
  BlockCopilotPlaceholder,
  placeholderSuggestionsFor,
} from "./BlockCopilotPlaceholder";

type Props = {
  block: UniversalBlock;
  index: number;
  total: number;
  draggingId: string | null;
  dropIndex: number | null;
  onDragStart: (id: string, index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
};

export function BlockContainer({
  block,
  index,
  total,
  draggingId,
  dropIndex,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const {
    updateBlock,
    duplicateBlock,
    deleteBlock,
    toggleCollapse,
    moveBlock,
    dismissCopilot,
  } = useBlockEditor();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        onDrop(index);
      }}
      className={[
        "group relative rounded-2xl border bg-white transition",
        draggingId === block.id ? "opacity-50" : "",
        dropIndex === index
          ? "border-slate-900/25 ring-2 ring-slate-900/10"
          : "border-slate-200/70 hover:border-slate-300 hover:shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)]",
      ].join(" ")}
    >
      <BlockHeader
        block={block}
        index={index}
        total={total}
        onTitleChange={(title) => updateBlock(block.id, { title })}
        onToggleCollapse={() => toggleCollapse(block.id)}
        onDuplicate={() => duplicateBlock(block.id)}
        onDelete={() => deleteBlock(block.id)}
        onMoveUp={() => moveBlock(block.id, -1)}
        onMoveDown={() => moveBlock(block.id, 1)}
        onDragStart={onDragStart}
        toolbarVisible={hovered}
      />
      <BlockBody
        block={block}
        onContentChange={(content) => updateBlock(block.id, { content })}
      />
      <BlockCopilotPlaceholder
        suggestions={placeholderSuggestionsFor(block.type)}
        dismissed={block.copilotDismissed}
        onDismiss={() => dismissCopilot(block.id)}
      />
    </motion.article>
  );
}
