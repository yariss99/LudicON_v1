import { Check } from "lucide-react";
import { Button } from "../../../components/ui";
import type { IntentArtifact } from "../../../types/studio";

type IntentPanelProps = {
  prompt: string;
  artifacts: IntentArtifact[];
  onToggle: (id: IntentArtifact["id"]) => void;
  onConfirm: () => void;
  onBack: () => void;
};

function IntentPanel({
  prompt,
  artifacts,
  onToggle,
  onConfirm,
  onBack,
}: IntentPanelProps) {
  const selectedCount = artifacts.filter((item) => item.included).length;

  return (
    <div className="studio-prompt-enter mx-auto w-full max-w-xl py-10">
      <p className="text-sm font-medium text-slate-500">I understood that you want to create:</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Your learning experience
      </h2>
      <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
        “{prompt}”
      </p>

      <ul className="mt-8 space-y-2">
        {artifacts.map((artifact) => (
          <li key={artifact.id}>
            <button
              type="button"
              onClick={() => onToggle(artifact.id)}
              className={[
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all",
                artifact.included
                  ? "border-slate-900 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                  : "border-slate-200 bg-slate-50/80 opacity-60 hover:opacity-90",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                  artifact.included
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-transparent",
                ].join(" ")}
              >
                <Check size={14} strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {artifact.label}
                </span>
                <span className="block text-xs text-slate-500">
                  {artifact.description}
                </span>
              </span>
              <span className="text-xs text-slate-400">
                {artifact.included ? "Included" : "Removed"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-400">
        You stay in control — remove anything you don’t need.
      </p>

      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="!rounded-xl"
          onClick={onBack}
        >
          Edit intention
        </Button>
        <Button
          type="button"
          variant="primary"
          className="!rounded-xl"
          onClick={onConfirm}
          disabled={selectedCount === 0}
        >
          Build workspace
        </Button>
      </div>
    </div>
  );
}

export default IntentPanel;
