import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WORKSHEET_BLOCK_TYPES } from "../constants";
import { useWorksheetStudio } from "../hooks/useWorksheetStudio";
import { WorksheetBlockCard } from "./WorksheetBlockCard";

export function WorksheetCanvas() {
  const { worksheet, addBlock, reorderBlocks, setProperties } =
    useWorksheetStudio();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const fromIndexRef = useRef<number | null>(null);

  const blocks = useMemo(
    () => [...worksheet.blocks].sort((a, b) => a.order - b.order),
    [worksheet.blocks],
  );

  const grouped = useMemo(() => {
    type BlockMeta = (typeof WORKSHEET_BLOCK_TYPES)[number];
    const map = new Map<string, BlockMeta[]>();
    for (const type of WORKSHEET_BLOCK_TYPES) {
      const list = map.get(type.category) ?? [];
      list.push(type);
      map.set(type.category, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <input
          value={worksheet.properties.title}
          onChange={(e) => setProperties({ title: e.target.value })}
          className="mb-1 w-full border-none bg-transparent text-3xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
          placeholder="Untitled worksheet"
        />
        <textarea
          value={worksheet.properties.instructions}
          onChange={(e) => setProperties({ instructions: e.target.value })}
          placeholder="Student instructions (optional)…"
          rows={2}
          className="mb-8 w-full resize-none border-none bg-transparent text-sm leading-relaxed text-slate-500 outline-none placeholder:text-slate-300"
        />

        <div className="flex flex-col gap-1">
          {blocks.map((block, index) => (
            <WorksheetBlockCard
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
              className="absolute left-0 z-10 mt-2 max-h-80 w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
            >
              {grouped.map(([category, types]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-1 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {category}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {types.map((type) => (
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
                  </div>
                </div>
              ))}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
