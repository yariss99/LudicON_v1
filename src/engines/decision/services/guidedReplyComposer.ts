import type {
  BlueprintSectionId,
  DecisionBlueprint,
  DecisionTurnOutput,
  NextPedagogicalAction,
  PedagogicalObjectiveId,
} from "../types";

/**
 * CE-004 — Pedagogical Conversation Engine reply shape.
 * 1 Understanding · 2 Canvas change · 3 Why needed · 4 One question
 */
export type GuidedReplyParts = {
  understanding: string;
  canvasUpdate: string | null;
  whyNeeded: string;
  question: string;
};

function softenOutcome(text: string): string {
  let outcome = text.trim();
  outcome = outcome.replace(
    /^students?\s+(will\s+be\s+able\s+to|will|should|can)\s+/i,
    "",
  );
  outcome = outcome.replace(/^to\s+/i, "");
  outcome = outcome.replace(
    /^elevii\s+(vor\s+putea\s+să|vor|trebuie\s+să|pot\s+să)\s+/i,
    "",
  );
  if (outcome.endsWith(".")) outcome = outcome.slice(0, -1);
  return outcome.charAt(0).toLowerCase() + outcome.slice(1);
}

function joinNatural(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} și ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} și ${parts[parts.length - 1]}`;
}

/** What PRIMA understood — never robotic, never checklist. */
function understandingFromBlueprint(
  blueprint: DecisionBlueprint,
  teacherMessage: string,
): string {
  const objective = blueprint.objectives[0];
  if (objective) {
    return `Înțeleg că ai dori ca elevii să ${softenOutcome(objective)}.`;
  }

  const ctx = blueprint.learningContext;
  if (ctx.subject && ctx.topic && ctx.grade) {
    return `Înțeleg că proiectezi o lecție de ${ctx.subject} despre ${ctx.topic} pentru ${ctx.grade}.`;
  }
  if (ctx.subject && ctx.topic) {
    return `Înțeleg că proiectezi o lecție de ${ctx.subject} despre ${ctx.topic}.`;
  }
  if (ctx.subject && ctx.grade) {
    return `Înțeleg că proiectezi o lecție de ${ctx.subject} pentru ${ctx.grade}.`;
  }
  if (ctx.topic) {
    return `Înțeleg că vrei ca elevii să exploreze „${ctx.topic}”.`;
  }
  if (ctx.subject) {
    return `Înțeleg că proiectezi o lecție de ${ctx.subject}.`;
  }

  const trimmed = teacherMessage.trim().replace(/\s+/g, " ");
  if (trimmed) {
    const snippet =
      trimmed.length > 140 ? `${trimmed.slice(0, 137)}…` : trimmed;
    if (
      /students?\s+(will|should|can|are able)/i.test(snippet) ||
      /able to/i.test(snippet) ||
      /elevii\s+(vor|trebuie|pot)/i.test(snippet)
    ) {
      return `Înțeleg că ai dori ca elevii să ${softenOutcome(snippet)}.`;
    }
    return `Înțeleg că vrei să proiectezi în jurul acestei intenții: „${snippet}”.`;
  }

  return "Sunt alături de tine — putem modela lecția un pas gândit pe rând.";
}

/** What changed on the lesson plan. */
function canvasUpdateLine(
  blueprint: DecisionBlueprint,
  updatedSections: BlueprintSectionId[],
): string | null {
  if (updatedSections.length === 0) return null;

  const ctx = blueprint.learningContext;
  const FIELD_RO: Record<string, string> = {
    topic: "tema",
    subject: "disciplina",
    grade: "clasa",
  };

  if (updatedSections.includes("learning_context")) {
    const parts: string[] = [];
    if (ctx.topic) parts.push(FIELD_RO.topic!);
    if (ctx.subject) parts.push(FIELD_RO.subject!);
    if (ctx.grade) parts.push(FIELD_RO.grade!);
    if (parts.length > 0) {
      return `Planul lecției a fost actualizat cu ${joinNatural(parts)}.`;
    }
    return "Planul lecției a fost actualizat cu contextul de învățare.";
  }

  if (updatedSections.includes("competencies")) {
    return "Planul lecției a fost actualizat cu competențele.";
  }
  if (updatedSections.includes("objectives")) {
    return "Planul lecției a fost actualizat cu obiectivele de învățare.";
  }
  if (
    updatedSections.includes("activities") ||
    updatedSections.includes("learning_flow")
  ) {
    return "Planul lecției a fost actualizat cu activitățile de învățare.";
  }
  if (updatedSections.includes("assessment")) {
    return "Planul lecției a fost actualizat cu abordarea evaluării.";
  }
  if (updatedSections.includes("resources")) {
    return "Planul lecției a fost actualizat cu resursele.";
  }
  if (updatedSections.includes("differentiation")) {
    return "Planul lecției a fost actualizat cu diferențierea.";
  }

  return "Planul lecției a fost actualizat cu ceea ce știm până acum.";
}

/** Why another detail is pedagogically needed — never expose AI internals. */
function whyNeeded(
  objectiveId: PedagogicalObjectiveId,
  blueprint: DecisionBlueprint,
): string {
  const ctx = blueprint.learningContext;

  switch (objectiveId) {
    case "capture_learning_context":
      if (!ctx.grade) {
        return "Pentru a alege competențele potrivite, am nevoie să știu clasa.";
      }
      if (!ctx.subject) {
        return "Disciplina ajută la alinierea așteptărilor curriculare cu lecția pe care o proiectezi.";
      }
      if (!ctx.topic) {
        return "O temă clară ține obiectivele, activitățile și evaluarea pe aceeași învățare.";
      }
      return "Încă un detaliu de context ne ajută să așezăm bine această lecție în plan.";
    case "capture_competencies":
      return "Competențele leagă lecția de creșterea durabilă a elevilor, dincolo de o singură activitate.";
    case "capture_objectives":
      return "Obiectivele clare ghidează activitățile, evaluarea și ce înseamnă succesul în clasă.";
    case "capture_learning_flow":
      return "Un parcurs coerent îi ajută pe elevi să treacă de la curiozitate la înțelegere cu un scop.";
    case "capture_activities":
      return "Activitățile transformă intenția ta în ceea ce elevii vor face cu adevărat.";
    case "capture_assessment":
      return "Evaluarea arată dacă învățarea dorită s-a așezat pentru elevii tăi.";
    case "capture_resources":
      return "Resursele fac planul pregătit pentru o clasă reală.";
    case "capture_differentiation":
      return "O adaptare gândită îi ajută pe toți elevii să rămână implicați în mod productiv.";
    case "capture_reflection":
      return "Un semn scurt de reflecție te ajută să știi ce a funcționat după lecție.";
    case "clarify_contradiction":
      return "Rămânând aliniați la o intenție clară, protejăm coerența întregii lecții.";
    case "clarify_low_confidence":
      return "O reformulare scurtă ne ajută să captăm intenția ta cu acuratețe în plan.";
    case "confirm_ready":
      return "O confirmare rapidă ne asigură că proiectul lecției este gata de verificare.";
    default:
      return "Acest detaliu întărește lecția care prinde contur.";
  }
}

function ensureSingleQuestion(question: string): string {
  const trimmed = question.trim();
  const parts = trimmed.split("?").filter((part) => part.trim().length > 0);
  if (parts.length <= 1) {
    return trimmed.endsWith("?") ? trimmed : `${trimmed}?`;
  }
  return `${parts[0]!.trim()}?`;
}

/**
 * CE-004 Pedagogical Conversation Engine
 * Understand → Canvas → Why → One highest-value question.
 */
export function composeGuidedReply(input: {
  blueprint: DecisionBlueprint;
  teacherMessage: string;
  updatedSections: BlueprintSectionId[];
  nextAction: NextPedagogicalAction;
  lost?: boolean;
}): GuidedReplyParts {
  if (input.lost && !input.blueprint.learningContext.topic) {
    return {
      understanding:
        "E în regulă — multe lecții bune încep cu o intenție mică și clară.",
      canvasUpdate: null,
      whyNeeded:
        "Un punct de plecare blând ne ajută să deschidem planul lecției fără să forțăm un proiect complet.",
      question:
        "Vrei să explorăm o lecție de Matematică pentru clasa a III-a sau o altă disciplină pe care o ai deja în minte?",
    };
  }

  if (
    input.nextAction.requiresClarification &&
    input.nextAction.objectiveId === "clarify_contradiction"
  ) {
    return {
      understanding:
        "Vreau să rămân fidel intenției tale și am observat două direcții care nu se potrivesc încă.",
      canvasUpdate: canvasUpdateLine(
        input.blueprint,
        input.updatedSections,
      ),
      whyNeeded: whyNeeded("clarify_contradiction", input.blueprint),
      question: ensureSingleQuestion(input.nextAction.question),
    };
  }

  return {
    understanding: understandingFromBlueprint(
      input.blueprint,
      input.teacherMessage,
    ),
    canvasUpdate: canvasUpdateLine(
      input.blueprint,
      input.updatedSections,
    ),
    whyNeeded: whyNeeded(input.nextAction.objectiveId, input.blueprint),
    question: ensureSingleQuestion(input.nextAction.question),
  };
}

export function formatGuidedReply(parts: GuidedReplyParts): string {
  return [
    parts.understanding,
    parts.canvasUpdate,
    parts.whyNeeded,
    parts.question,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Convenience for DecisionTurnOutput assembly */
export function buildPrimaGuidedMessage(
  output: Pick<
    DecisionTurnOutput,
    "blueprint" | "updatedSections" | "nextAction"
  > & { teacherMessage: string; lost?: boolean },
): { parts: GuidedReplyParts; primaMessage: string } {
  const parts = composeGuidedReply({
    blueprint: output.blueprint,
    teacherMessage: output.teacherMessage,
    updatedSections: output.updatedSections,
    nextAction: output.nextAction,
    lost: output.lost,
  });
  return { parts, primaMessage: formatGuidedReply(parts) };
}
