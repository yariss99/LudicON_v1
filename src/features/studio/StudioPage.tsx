import { useState } from "react";
import type { StudioSuggestionId } from "../../types/studio";
import { STUDIO_PROMPT_EXAMPLES } from "./constants";
import IntentPanel from "./components/IntentPanel";
import PlanningAnimation from "./components/PlanningAnimation";
import PromptInput from "./components/PromptInput";
import StudioShell from "./components/StudioShell";
import SuggestionGrid from "./components/SuggestionGrid";
import { useStudioPlanning } from "./hooks/useStudioPlanning";

function StudioPage() {
  const {
    phase,
    pendingPrompt,
    artifacts,
    openIntent,
    toggleArtifact,
    confirmIntent,
    backToCompose,
    finishPlanning,
  } = useStudioPlanning();
  const [prompt, setPrompt] = useState("");
  const [suggestionId, setSuggestionId] = useState<
    StudioSuggestionId | undefined
  >();

  if (phase === "intent") {
    return (
      <StudioShell>
        <IntentPanel
          prompt={pendingPrompt}
          artifacts={artifacts}
          onToggle={toggleArtifact}
          onConfirm={confirmIntent}
          onBack={backToCompose}
        />
      </StudioShell>
    );
  }

  if (phase === "planning") {
    return (
      <StudioShell>
        <PlanningAnimation active onComplete={finishPlanning} />
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <div className="flex flex-1 flex-col justify-center py-8">
        <div className="studio-hero-enter mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            What would you like your students to experience today?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            One intention. PRIMA builds the living workspace.
          </p>
        </div>

        <PromptInput
          value={prompt}
          onChange={(value) => {
            setPrompt(value);
            setSuggestionId(undefined);
          }}
          onSubmit={() => openIntent(prompt, suggestionId)}
          placeholder={STUDIO_PROMPT_EXAMPLES[0]}
        />

        <div className="mt-12">
          <SuggestionGrid
            onSelect={(suggestion) => {
              setSuggestionId(suggestion.id);
              setPrompt(suggestion.prompt);
            }}
          />
        </div>
      </div>
    </StudioShell>
  );
}

export default StudioPage;
