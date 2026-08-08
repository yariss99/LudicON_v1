import { useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { presentationBlockMeta } from "../constants";
import { aiSuggestionForPresentation } from "../services/blockAiSuggestions";
import { usePresentationStudio } from "../hooks/usePresentationStudio";
import type { PresentationBlock } from "../types";

type Props = {
  block: PresentationBlock;
  index: number;
  draggingId: string | null;
  dropIndex: number | null;
  onDragStart: (id: string, index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  focused?: boolean;
};

export function PresentationBlockCard({
  block,
  index,
  draggingId,
  dropIndex,
  onDragStart,
  onDragOver,
  onDrop,
  focused = false,
}: Props) {
  const {
    updateBlock,
    duplicateBlock,
    deleteBlock,
    toggleCollapse,
    applyAiImprove,
    dismissAiHint,
  } = usePresentationStudio();
  const [hovered, setHovered] = useState(false);
  const meta = presentationBlockMeta(block.type);
  const suggestion = aiSuggestionForPresentation(block.type);
  const showAi =
    !block.aiHintDismissed && (hovered || focused || block.content.length > 8);

  return (
    <motion.article
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
      className={[
        "group relative rounded-2xl border bg-white transition",
        focused
          ? "border-slate-900/20 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.35)]"
          : "border-transparent hover:border-slate-200/80 hover:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.2)]",
        draggingId === block.id ? "opacity-50" : "",
        dropIndex === index ? "ring-2 ring-slate-900/10" : "",
      ].join(" ")}
    >
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
        >
          ⋮⋮
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Slide {index + 1} · {meta?.label}
            </span>
            <input
              value={block.title}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              className="min-w-0 flex-1 border-none bg-transparent text-base font-semibold tracking-tight text-slate-900 outline-none"
              aria-label="Slide title"
            />
            <div
              className={[
                "flex items-center gap-0.5 transition",
                hovered || focused ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                onClick={() => toggleCollapse(block.id)}
              >
                {block.collapsed ? "Expand" : "Collapse"}
              </button>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                onClick={() => duplicateBlock(block.id)}
              >
                Duplicate
              </button>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                onClick={() => deleteBlock(block.id)}
              >
                Delete
              </button>
            </div>
          </div>

          {!block.collapsed ? (
            <div className="pb-3 pr-2 pt-1">
              <textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                placeholder={meta?.placeholder ?? "Write here…"}
                rows={focused ? 8 : 4}
                className="w-full resize-y border-none bg-transparent text-[0.95rem] leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                <textarea
                  value={block.teacherNotes}
                  onChange={(e) =>
                    updateBlock(block.id, { teacherNotes: e.target.value })
                  }
                  placeholder="Teacher notes (not shown to students)…"
                  rows={2}
                  className="w-full resize-y rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 outline-none placeholder:text-slate-400"
                />
                <label className="flex flex-col gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-slate-400">
                  Seconds
                  <input
                    type="number"
                    min={10}
                    value={block.estimatedSeconds}
                    onChange={(e) =>
                      updateBlock(block.id, {
                        estimatedSeconds: Number(e.target.value) || 60,
                      })
                    }
                    className="h-9 w-24 rounded-xl border border-slate-200 px-2 text-sm font-normal text-slate-700"
                  />
                </label>
              </div>

              {showAi ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                >
                  <p className="flex-1 text-xs text-slate-500">
                    {suggestion.prompt}
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    onClick={() => applyAiImprove(block.id)}
                  >
                    {suggestion.label}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs text-slate-500"
                    onClick={() => dismissAiHint(block.id)}
                  >
                    Dismiss
                  </button>
                </motion.div>
              ) : null}
            </div>
          ) : (
            <p className="pb-3 text-sm text-slate-400">
              Collapsed · ~{Math.round(block.estimatedSeconds / 60) || 1} min
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
