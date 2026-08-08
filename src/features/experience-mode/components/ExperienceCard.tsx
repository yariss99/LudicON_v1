import { motion } from "framer-motion";
import type { ExperienceCardData, ExperienceMode } from "../types";

type ExperienceCardProps = {
  card: ExperienceCardData;
  selected: boolean;
  selecting: boolean;
  onSelect: (mode: ExperienceMode) => void;
  onPreview: (mode: ExperienceMode) => void;
};

export function ExperienceCard({
  card,
  selected,
  selecting,
  onSelect,
  onPreview,
}: ExperienceCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: selected ? 1.02 : 1,
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={[
        "relative flex h-full flex-col rounded-3xl border bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.18)]",
        selected
          ? "border-slate-900 ring-2 ring-slate-900/10"
          : "border-slate-200/80",
        selecting && !selected ? "opacity-50" : "",
      ].join(" ")}
    >
      {selected ? (
        <motion.div
          layoutId="experience-selected-glow"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900/[0.03] to-transparent"
        />
      ) : null}

      <div className="relative flex flex-1 flex-col">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl shadow-inner">
          <span aria-hidden>{card.emoji}</span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {card.title}
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-500">
          {card.description}
        </p>

        <ul className="mt-6 space-y-2.5">
          {card.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-slate-700"
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700"
                aria-hidden
              >
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="button"
            onClick={() => onSelect(card.id)}
            disabled={selecting}
            className={[
              "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
              card.id === "guided"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-900 text-white hover:bg-slate-800",
              selecting ? "cursor-wait opacity-80" : "",
            ].join(" ")}
          >
            {selecting && selected ? "Starting…" : card.cta}
          </button>

          <button
            type="button"
            onClick={() => onPreview(card.id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <span aria-hidden>▶</span>
            Preview Experience
          </button>
        </div>
      </div>
    </motion.article>
  );
}
