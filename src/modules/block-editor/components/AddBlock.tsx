import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BlockRegistry } from "../registry/BlockRegistry";
import { useBlockEditor } from "../hooks/useBlockEditor";

export function AddBlock() {
  const { addBlock } = useBlockEditor();
  const [open, setOpen] = useState(false);
  const types = BlockRegistry.list();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white hover:text-slate-900"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-xs text-white">
          +
        </span>
        Add block
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-20 mt-2 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_48px_-28px_rgba(15,23,42,0.45)] sm:grid-cols-3"
          >
            {types.map((def) => (
              <button
                key={def.type}
                type="button"
                onClick={() => {
                  addBlock(def.type);
                  setOpen(false);
                }}
                className="rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="text-base" aria-hidden>
                  {def.icon}
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-900">
                  {def.label}
                </span>
                <span className="mt-0.5 block text-[0.7rem] text-slate-500">
                  {def.description}
                </span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
