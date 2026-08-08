import { useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { assessmentBlockMeta } from "../constants";
import { aiSuggestionForAssessment } from "../services/blockAiSuggestions";
import { useAssessmentStudio } from "../hooks/useAssessmentStudio";
import type { AssessmentBlock } from "../types";

type Props = {
  block: AssessmentBlock;
  index: number;
  draggingId: string | null;
  dropIndex: number | null;
  onDragStart: (id: string, index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  focused?: boolean;
};

export function AssessmentBlockCard({
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
    projectCompetencies,
    updateBlock,
    toggleBlockCompetency,
    duplicateBlock,
    deleteBlock,
    toggleCollapse,
    applyAiImprove,
    dismissAiHint,
  } = useAssessmentStudio();
  const [hovered, setHovered] = useState(false);
  const meta = assessmentBlockMeta(block.type);
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
              {meta?.category} · {meta?.label}
            </span>
            <input
              value={block.title}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              className="min-w-0 flex-1 border-none bg-transparent text-base font-semibold tracking-tight text-slate-900 outline-none"
              aria-label="Block title"
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
                rows={focused ? 10 : 5}
                className="w-full resize-y border-none bg-transparent text-[0.95rem] leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
              />

              <div className="mt-2">
                <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Competencies
                </p>
                {projectCompetencies.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Add competencies in project Settings to link this item.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {projectCompetencies.map((c) => {
                      const on = block.competencyIds.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleBlockCompetency(block.id, c)}
                          className={[
                            "rounded-lg px-2 py-1 text-xs font-medium transition",
                            on
                              ? "bg-slate-900 text-white"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {showAi ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                >
                  <p className="flex-1 text-xs text-slate-500">
                    {aiSuggestionForAssessment(block.type)}
                  </p>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    onClick={() => applyAiImprove(block.id)}
                  >
                    Improve
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
              Collapsed
              {block.competencyIds.length
                ? ` · ${block.competencyIds.length} competencies`
                : ""}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
