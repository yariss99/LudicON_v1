import type { ReflectionMode, ReflectionPrompt } from "./types";

export const DEFAULT_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: "obj_achieved",
    mode: "all",
    questionRo: "Elevii au atins obiectivele de învățare?",
    pedagogicalFocus: "objectives",
  },
  {
    id: "engagement_peak",
    mode: "all",
    questionRo: "Care activitate a generat cea mai mare implicare?",
    pedagogicalFocus: "engagement",
  },
  {
    id: "difficulties",
    mode: "guided",
    questionRo: "Unde au întâmpinat elevii dificultăți?",
    pedagogicalFocus: "assessment",
  },
  {
    id: "timing",
    mode: "quick",
    questionRo: "Timpul estimat a fost realist?",
    pedagogicalFocus: "timing",
  },
  {
    id: "change_next",
    mode: "all",
    questionRo: "Ce ai schimba data viitoare?",
    pedagogicalFocus: "habit",
  },
  {
    id: "assessment_fit",
    mode: "guided",
    questionRo: "Evaluarea a măsurat ceea ce ți-ai propus?",
    pedagogicalFocus: "assessment",
  },
  {
    id: "differentiation",
    mode: "comprehensive",
    questionRo: "Activitățile diferențiate au fost eficiente?",
    pedagogicalFocus: "differentiation",
  },
  {
    id: "digital",
    mode: "evidence",
    questionRo: "Resursele digitale au sprijinit învățarea?",
    pedagogicalFocus: "resources",
  },
];

export function promptsForMode(mode: ReflectionMode): ReflectionPrompt[] {
  if (mode === "voice") {
    return DEFAULT_REFLECTION_PROMPTS.filter((p) => p.mode === "all");
  }
  if (mode === "quick") {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === "all" || p.mode === "quick",
    ).slice(0, 3);
  }
  if (mode === "guided") {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === "all" || p.mode === "guided" || p.mode === "quick",
    );
  }
  if (mode === "evidence") {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === "all" || p.mode === "evidence" || p.mode === "guided",
    );
  }
  return DEFAULT_REFLECTION_PROMPTS.filter((p) => p.mode !== "voice");
}
