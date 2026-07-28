import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import StudioShell from "../studio/components/StudioShell";
import { useStudioPlanning } from "../studio/hooks/useStudioPlanning";
import ThinkingScene from "./components/ThinkingScene";
import WelcomeBackScene from "./components/WelcomeBackScene";
import WelcomeScene from "./components/WelcomeScene";
import { readLastWorkspace } from "./sessionMemory";

/**
 * Mission X — The 3-Minute Demo.
 * The product explains itself: welcome → intention → thinking → workspace → return.
 */
function ExperienceHome() {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { phase, beginExperience, finishPlanning } = useStudioPlanning();
  const [prompt, setPrompt] = useState("");
  const [freshStart, setFreshStart] = useState(false);

  const memory = useMemo(() => readLastWorkspace(), []);
  const rememberedProject = memory
    ? getProject(memory.projectId)
    : undefined;

  const showWelcomeBack =
    !freshStart && phase === "compose" && Boolean(memory && rememberedProject);

  if (phase === "planning") {
    return (
      <StudioShell>
        <ThinkingScene active onComplete={finishPlanning} />
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      {showWelcomeBack && memory ? (
        <WelcomeBackScene
          memory={memory}
          onContinue={() => navigate(`/studio/${memory.projectId}`)}
          onStartFresh={() => {
            setFreshStart(true);
            setPrompt("");
          }}
        />
      ) : (
        <WelcomeScene
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={() => beginExperience(prompt)}
        />
      )}
    </StudioShell>
  );
}

export default ExperienceHome;
