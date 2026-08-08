import { AnimatePresence, motion } from "framer-motion";
import { BlockRegistry } from "../registry/BlockRegistry";
import type { UniversalBlock } from "../types";

type Props = {
  block: UniversalBlock;
  onContentChange: (content: string) => void;
};

export function BlockBody({ block, onContentChange }: Props) {
  const def = BlockRegistry.get(block.type);

  return (
    <AnimatePresence initial={false}>
      {!block.collapsed ? (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="px-3 pb-3 pl-10 sm:pl-12">
            <textarea
              value={block.content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={block.type === "text" ? 4 : 3}
              placeholder={def?.placeholder ?? "Write…"}
              className="w-full resize-y rounded-xl border border-transparent bg-slate-50/80 px-3 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-slate-200 focus:bg-white"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
