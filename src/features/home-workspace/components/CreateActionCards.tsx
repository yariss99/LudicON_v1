import { motion } from "framer-motion";
import { CREATE_ACTIONS, type CreateActionId } from "../constants";

type Props = {
  onAction: (id: CreateActionId) => void;
};

export function CreateActionCards({ onAction }: Props) {
  return (
    <section aria-labelledby="create-today">
      <h2 id="create-today" className="sr-only">
        Create something new
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CREATE_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.05 + index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="group flex min-h-[9.5rem] flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] transition hover:border-slate-300 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]"
          >
            <span className="text-2xl" aria-hidden>
              {action.emoji}
            </span>
            <span className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
              {action.title}
            </span>
            <span className="mt-1 text-sm leading-relaxed text-slate-500">
              {action.description}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
