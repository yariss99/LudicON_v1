import type { StagePresence } from "../../../types/pedagogy";

const LABELS: Record<string, string> = {
  attention: "Attention",
  discovery: "Discovery",
  practice: "Practice",
  reflection: "Reflection",
  assessment: "Assessment",
};

type StageStripProps = {
  stages: StagePresence[];
};

function StageStrip({ stages }: StageStripProps) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Educational stages">
      {stages.map((stage) => (
        <li
          key={stage.stage}
          title={
            stage.present
              ? `Present: ${stage.evidence.join(", ") || "yes"}`
              : "Not yet visible — optional to add"
          }
          className={[
            "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
            stage.present
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-slate-50 text-slate-400 ring-slate-200/80",
          ].join(" ")}
        >
          {LABELS[stage.stage] ?? stage.stage}
        </li>
      ))}
    </ul>
  );
}

export default StageStrip;
