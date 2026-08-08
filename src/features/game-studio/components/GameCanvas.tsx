import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GAME_BLOCK_TYPES } from "../constants";
import { useGameStudio } from "../hooks/useGameStudio";
import { GameBlockCard } from "./GameBlockCard";

export function GameCanvas() {
  const { game, addBlock, reorderBlocks, setProperties } = useGameStudio();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const fromIndexRef = useRef<number | null>(null);

  const blocks = useMemo(
    () => [...game.blocks].sort((a, b) => a.order - b.order),
    [game.blocks],
  );

  const grouped = useMemo(() => {
    type Meta = (typeof GAME_BLOCK_TYPES)[number];
    const map = new Map<string, Meta[]>();
    for (const type of GAME_BLOCK_TYPES) {
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
          value={game.properties.title}
          onChange={(e) => setProperties({ title: e.target.value })}
          className="mb-1 w-full border-none bg-transparent text-3xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
          placeholder="Untitled game"
        />
        <input
          value={game.properties.learningObjective}
          onChange={(e) =>
            setProperties({ learningObjective: e.target.value })
          }
          className="mb-2 w-full border-none bg-transparent text-sm font-medium text-slate-600 outline-none placeholder:text-slate-300"
          placeholder="Learning objective…"
        />
        <textarea
          value={game.properties.instructions}
          onChange={(e) => setProperties({ instructions: e.target.value })}
          placeholder="How to play (optional)…"
          rows={2}
          className="mb-8 w-full resize-none border-none bg-transparent text-sm leading-relaxed text-slate-500 outline-none placeholder:text-slate-300"
        />

        <div className="flex flex-col gap-1">
          {blocks.map((block, index) => (
            <GameBlockCard
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
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <span className="text-lg leading-none">+</span>
            Add block
          </button>
          {paletteOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 z-10 mt-2 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
            >
              {grouped.map(([category, types]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-1.5 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {category}
                  </p>
                  {types.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        addBlock(type.id);
                        setPaletteOpen(false);
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
