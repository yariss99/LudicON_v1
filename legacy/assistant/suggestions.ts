import type { Project } from "@ludicon/domain";

import type { AnyDocument } from "../../lib/documents";
import type { BuilderKind } from "../builder/types";

/**
 * What PRIMA notices.
 *
 * Ported from the old `assistantProactive` rules — which were, despite the
 * naming, entirely deterministic: seven predicates over the project's
 * documents, no model call anywhere. That honesty is worth keeping. What is
 * dropped is the intent-detection layer that matched 23 hard-coded Romanian
 * substrings against a free-text box and answered with a template: a chat
 * surface that never called anything is the "chat-as-home" anti-pattern with
 * extra steps.
 *
 * Capped at three by `topSuggestions` — CH02 Law 8.
 */
export type AssistantSuggestion = {
  id: string;
  title: string;
  detail: string;
  /** What accepting it does. Omitted when the suggestion is only an observation. */
  action?: { label: string; kind: BuilderKind };
};

export type AssistantInput = {
  project: Project | null;
  documents: readonly AnyDocument[];
};

export function buildSuggestions(input: AssistantInput): AssistantSuggestion[] {
  const { project, documents } = input;

  if (project === null) {
    return [
      {
        id: "no-project",
        title: "Deschide un proiect ca să lucrăm împreună",
        detail:
          "Tot ce îți pot sugera pornește de la o temă concretă — disciplina, clasa și materialele pe care le-ai început deja.",
      },
    ];
  }

  const has = (kind: BuilderKind): boolean =>
    documents.some((document) => document.kind === kind);

  const out: AssistantSuggestion[] = [];

  if (!has("lesson_plan")) {
    out.push({
      id: "no-lesson",
      title: "Începe cu designul lecției",
      detail: `„${project.title}” nu are încă o lecție. De acolo pornesc toate celelalte materiale.`,
      action: { label: "Creează lecția", kind: "lesson_plan" },
    });
  }

  if (has("lesson_plan") && !has("assessment")) {
    out.push({
      id: "no-assessment",
      title: "Adaugă o verificare scurtă",
      detail:
        "După lecție, câteva întrebări îți arată cine a înțeles înainte să treci mai departe.",
      action: { label: "Creează evaluarea", kind: "assessment" },
    });
  }

  const drafts = documents.filter(
    (document) => document.status === "draft",
  ).length;
  if (drafts >= 3) {
    out.push({
      id: "many-drafts",
      title: `Ai ${drafts} materiale în lucru`,
      detail:
        "Poate merită să închei unul înainte de a începe altul — publicarea îl face disponibil pentru clasă.",
    });
  }

  const unchecked = documents.filter(
    (document) => document.validation === null && document.status !== "draft",
  ).length;
  if (unchecked > 0) {
    out.push({
      id: "unchecked",
      title: `${unchecked} materiale nu au fost verificate`,
      detail:
        "O verificare rapidă îți arată ce ar mai avea nevoie de completat, fără să schimbe nimic.",
    });
  }

  if (has("lesson_plan") && !has("story") && !has("game")) {
    out.push({
      id: "engagement",
      title: "O poveste sau un joc ar prinde bine aici",
      detail: `Pentru ${project.subject.toLocaleLowerCase("ro-RO")} la ${project.grade}, o activitate cu ritm diferit ține clasa aproape.`,
      action: { label: "Creează povestea", kind: "story" },
    });
  }

  if (out.length === 0) {
    out.push({
      id: "steady",
      title: "Proiectul arată echilibrat",
      detail:
        "Ai lecția, materialele și verificarea. Deocamdată nu am ce să adaug — continuă cum ai început.",
    });
  }

  return out;
}

/** "AI tips capped at ≤3" — CH02 Law 8, enforced in one place. */
export const topSuggestions = (
  suggestions: readonly AssistantSuggestion[],
  dismissed: readonly string[],
): AssistantSuggestion[] =>
  suggestions
    .filter((suggestion) => !dismissed.includes(suggestion.id))
    .slice(0, 3);
