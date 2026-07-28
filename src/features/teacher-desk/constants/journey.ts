import type { JourneyStageId } from "../types";

export const JOURNEY_STAGE_IDS = [
  "context",
  "competencies",
  "objectives",
  "activities",
  "assessment",
  "resources",
  "review",
  "generate",
] as const satisfies readonly JourneyStageId[];

export const JOURNEY_STAGE_LABELS: Record<JourneyStageId, string> = {
  context: "Context",
  competencies: "Competențe",
  objectives: "Obiective",
  activities: "Activități",
  assessment: "Evaluare",
  resources: "Resurse",
  review: "Verificare",
  generate: "Materiale",
};

/** Natural-language next steps — never percentage language. */
export const JOURNEY_NEXT_STEPS: Record<JourneyStageId, string> = {
  context:
    "Începe prin a descrie contextul de predare, ca PRIMA să înțeleagă clasa ta.",
  competencies:
    "Clarifică competențele pe care această lecție le dezvoltă.",
  objectives:
    "Definește obiective clare de învățare care ghidează activitățile și evaluarea.",
  activities:
    "Modelează activitățile care aduc obiectivele la viață.",
  assessment:
    "Proiectează o evaluare care măsoară cu adevărat ceea ce elevii ar trebui să atingă.",
  resources:
    "Pregătește materialele pe care tu și elevii le veți folosi la clasă.",
  review:
    "Verifică proiectul lecției cu grijă — confirmă-l când ți se pare gata pentru clasă.",
  generate:
    "Creează materialele didactice pornind de la proiectul lecției confirmat.",
};

/** Discrete remaining-time estimates (minutes). */
export const JOURNEY_TIME_ESTIMATES_MIN = [8, 12, 25] as const;
