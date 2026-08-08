import { useMemo } from "react";
import { storyBlockLabel } from "../constants";
import { useStoryStudio } from "../hooks/useStoryStudio";

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function StoryTimeline({ activeId, onSelect }: Props) {
  const { story } = useStoryStudio();
  const blocks = useMemo(
    () => [...story.blocks].sort((a, b) => a.order - b.order),
    [story.blocks],
  );

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        Story Timeline
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        {blocks.length} beats · drag blocks on the canvas to reorder
      </p>
      <ol className="mt-4 space-y-0">
        {blocks.map((block, index) => {
          const active = activeId === block.id;
          return (
            <li key={block.id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < blocks.length - 1 ? (
                <span
                  className="absolute left-[9px] top-5 bottom-0 w-px bg-slate-200"
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onSelect(block.id);
                  document
                    .getElementById(`story-block-${block.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="relative z-[1] mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                aria-label={`Go to ${block.title}`}
              >
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    active ? "bg-slate-900" : "bg-slate-300",
                  ].join(" ")}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect(block.id);
                  document
                    .getElementById(`story-block-${block.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={[
                  "min-w-0 flex-1 rounded-xl px-2 py-1 text-left transition",
                  active ? "bg-slate-50" : "hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-slate-400">
                  {storyBlockLabel(block.type)}
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-slate-800">
                  {block.title || `Beat ${index + 1}`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
