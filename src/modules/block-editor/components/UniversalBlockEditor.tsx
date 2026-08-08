import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { useBlockEditor } from "../hooks/useBlockEditor";
import { AddBlock } from "./AddBlock";
import { BlockContainer } from "./BlockContainer";

/**
 * Universal Block Editor shell — reusable across every educational resource.
 */
export function UniversalBlockEditor() {
  const {
    document,
    blocks,
    autosave,
    lastSavedAt,
    canUndo,
    canRedo,
    setTitle,
    reorderBlocks,
    saveNow,
    undo,
    redo,
  } = useBlockEditor();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const fromIndexRef = useRef<number | null>(null);

  const autosaveLabel =
    autosave === "saving"
      ? "Saving…"
      : autosave === "dirty"
        ? "Editing…"
        : lastSavedAt
          ? `Saved ${formatRelativeTime(lastSavedAt)}`
          : "Synced";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Universal Block Editor
          </p>
          <input
            value={document.title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border-none bg-transparent text-2xl font-semibold tracking-tight text-slate-900 outline-none"
            aria-label="Document title"
          />
          <p className="mt-1 text-xs text-slate-400">{autosaveLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={saveNow}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <BlockContainer
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              draggingId={draggingId}
              dropIndex={dropIndex}
              onDragStart={(id, from) => {
                setDraggingId(id);
                fromIndexRef.current = from;
              }}
              onDragOver={(i) => setDropIndex(i)}
              onDrop={(to) => {
                const from = fromIndexRef.current;
                if (from != null) reorderBlocks(from, to);
                setDraggingId(null);
                setDropIndex(null);
                fromIndexRef.current = null;
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <AddBlock />
    </div>
  );
}
