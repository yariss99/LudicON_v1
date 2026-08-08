import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LESSON_BLOCK_TYPES } from "../constants";
import { useLessonStudio } from "../hooks/useLessonStudio";
import { EducationalBlock } from "./EducationalBlock";

export function LessonCanvas() {
  const { lesson, addBlock, reorderBlocks, updateBlock, setProperties } =
    useLessonStudio();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const fromIndexRef = useRef<number | null>(null);

  const blocks = [...lesson.blocks].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const onApply = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        action: string;
        content: string;
      };
      if (!detail?.content) return;
      const plain = detail.content
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*/g, "")
        .trim();
      const sorted = [...lesson.blocks].sort((a, b) => a.order - b.order);
      if (detail.action === "insert" || detail.action === "append") {
        if (sorted.length === 0) {
          addBlock("notes");
          return;
        }
        const target = sorted[sorted.length - 1];
        if (!target) return;
        updateBlock(target.id, {
          content:
            detail.action === "append" && target.content
              ? `${target.content}\n\n${plain}`
              : plain,
        });
      }
      if (detail.action === "replace" && sorted[0]) {
        updateBlock(sorted[0].id, { content: plain });
      }
    };
    window.addEventListener("prima:copilot-apply", onApply);
    return () => window.removeEventListener("prima:copilot-apply", onApply);
  }, [addBlock, lesson.blocks, updateBlock]);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <input
          value={lesson.properties.title}
          onChange={(e) => setProperties({ title: e.target.value })}
          className="mb-1 w-full border-none bg-transparent text-3xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
          placeholder="Untitled lesson"
        />
        <p className="mb-8 text-sm text-slate-400">
          {[lesson.properties.subject, lesson.properties.grade]
            .filter(Boolean)
            .join(" · ") || "Add subject and grade in properties"}
          {" · "}
          Type below — blocks autosave as you go.
        </p>

        <div className="flex flex-col gap-1">
          {blocks.map((block, index) => (
            <EducationalBlock
              key={block.id}
              block={block}
              index={index}
              draggingId={draggingId}
              dropIndex={dropIndex}
              onDragStart={(id, from) => {
                setDraggingId(id);
                fromIndexRef.current = from;
              }}
              onDragOver={(to) => setDropIndex(to)}
              onDrop={(to) => {
                const from = fromIndexRef.current;
                if (from != null) reorderBlocks(from, to);
                setDraggingId(null);
                setDropIndex(null);
                fromIndexRef.current = null;
              }}
            />
          ))}
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setPaletteOpen((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <span className="text-lg leading-none">+</span>
            Add block
          </button>

          {paletteOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 z-10 mt-2 grid w-full max-w-md grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              {LESSON_BLOCK_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    addBlock(type.id);
                    setPaletteOpen(false);
                  }}
                >
                  {type.label}
                </button>
              ))}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
