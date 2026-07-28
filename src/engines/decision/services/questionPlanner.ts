import {
  OBJECTIVE_FOR_SECTION,
  SECTION_ORDER,
} from "../constants";
import type {
  BlueprintSectionId,
  ConfidenceMap,
  ConversationState,
  DecisionBlueprint,
  MissingInformationItem,
  NextPedagogicalAction,
  PedagogicalObjectiveId,
} from "../types";

function contextGapQuestion(blueprint: DecisionBlueprint): string | null {
  const ctx = blueprint.learningContext;
  if (!ctx.subject) return "Pentru ce disciplină pregătești această lecție?";
  if (!ctx.grade) return "La ce clasă predai?";
  if (!ctx.topic) return "Ce temă sau idee ar trebui să stea în centrul lecției?";
  return null;
}

function questionFor(
  objectiveId: PedagogicalObjectiveId,
  blueprint: DecisionBlueprint,
): string {
  const ctx = blueprint.learningContext;
  const about = ctx.topic
    ? ` despre ${ctx.topic}`
    : ctx.subject
      ? ` la ${ctx.subject}`
      : "";

  switch (objectiveId) {
    case "capture_learning_context":
      return (
        contextGapQuestion(blueprint) ??
        "Cam cât ar dura această lecție — de exemplu, o oră de 45 de minute?"
      );
    case "capture_competencies":
      return `Ce competență ar trebui să întărească această lecție${about}? O formulare clară este suficientă.`;
    case "capture_objectives":
      return `Ce ar trebui să poată face elevii la final${about}? Un obiectiv clar este un bun început.`;
    case "capture_learning_flow":
      return "Cum ar trebui să se miște lecția — de exemplu, captare → explorare → exersare → încheiere?";
    case "capture_activities":
      return "Ce vor face elevii ca să ajungă la această înțelegere? Descrie o activitate pe scurt.";
    case "capture_assessment":
      return "Cum ai putea verifica blând dacă învățarea s-a așezat — în timpul lecției sau la final?";
    case "capture_resources":
      return "Ce materiale sau instrumente îți imaginezi deja pentru clasă?";
    case "capture_differentiation":
      return "Există o adaptare care i-ar ajuta pe elevii care au nevoie de mai mult sprijin sau de o provocare mai bogată?";
    case "capture_reflection":
      return "După lecție, după ce vei privi ca să știi că a funcționat?";
    case "clarify_contradiction":
      return "Am observat două direcții care nu se potrivesc încă. Pe care o păstrăm?";
    case "clarify_low_confidence":
      return "Mulțumesc — poți spune asta încă o dată, într-o propoziție scurtă?";
    case "confirm_ready":
      return "Proiectul lecției pare gata de verificare. Îl deschidem împreună sau mai rafinăm o parte?";
  }
}

function sectionFilled(
  sectionId: BlueprintSectionId,
  blueprint: DecisionBlueprint,
): boolean {
  switch (sectionId) {
    case "learning_context": {
      const ctx = blueprint.learningContext;
      return Boolean(ctx.subject && ctx.grade && ctx.topic);
    }
    case "competencies":
      return blueprint.competencies.length > 0;
    case "objectives":
      return blueprint.objectives.length > 0;
    case "learning_flow":
      return blueprint.learningFlow.length > 0;
    case "activities":
      return blueprint.activities.length > 0;
    case "assessment":
      return blueprint.assessment.length > 0;
    case "resources":
      return blueprint.resources.length > 0;
    case "differentiation":
      return blueprint.differentiation.length > 0;
    case "reflection":
      return blueprint.reflection.length > 0;
    case "validation":
      return false;
  }
}

function confidenceOk(level: ConfidenceMap[BlueprintSectionId]["level"]): boolean {
  return level === "high" || level === "medium";
}

/**
 * Question Planner — exactly one pedagogical objective per turn.
 * Never repeats an already-asked question string.
 */
export async function planNextQuestion(input: {
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  missingInformation: MissingInformationItem[];
  conversation: ConversationState;
  hasContradiction: boolean;
  unclearAnswer: boolean;
  readyForApproval: boolean;
}): Promise<NextPedagogicalAction> {
  const asked = new Set(input.conversation.askedQuestions);

  const uniqueQuestion = (
    objectiveId: PedagogicalObjectiveId,
    sectionId: BlueprintSectionId,
    requiresClarification: boolean,
    reason: string,
  ): NextPedagogicalAction => {
    let question = questionFor(objectiveId, input.blueprint);
    // Never repeat exact question text
    if (asked.has(question)) {
      question = `${question} (Spune-mi orice detaliu pe care nu l-am acoperit încă.)`;
    }
    return {
      objectiveId,
      sectionId,
      question,
      requiresClarification,
      reason,
    };
  };

  if (input.hasContradiction) {
    return uniqueQuestion(
      "clarify_contradiction",
      "validation",
      true,
      "Contradiction detected — progression stopped.",
    );
  }

  if (input.unclearAnswer && input.conversation.currentObjectiveId) {
    const sectionId =
      (Object.entries(
        // resolve section from current objective
        {
          capture_learning_context: "learning_context",
          capture_competencies: "competencies",
          capture_objectives: "objectives",
          capture_learning_flow: "learning_flow",
          capture_activities: "activities",
          capture_assessment: "assessment",
          capture_resources: "resources",
          capture_differentiation: "differentiation",
          capture_reflection: "reflection",
        } as Record<string, BlueprintSectionId>,
      ).find(
        ([objective]) => objective === input.conversation.currentObjectiveId,
      )?.[1] as BlueprintSectionId | undefined) ?? "learning_context";

    return uniqueQuestion(
      "clarify_low_confidence",
      sectionId,
      true,
      "Low clarity — ask one clarification question.",
    );
  }

  // Walk mandatory order — never skip unfilled mandatory sections
  for (const sectionId of SECTION_ORDER) {
    if (sectionId === "validation") continue;

    const filled = sectionFilled(sectionId, input.blueprint);
    const confidence = input.confidenceMap[sectionId];

    if (!filled || !confidenceOk(confidence.level)) {
      // Prefer inference already applied for competencies — skip ask if medium+ assumed fill
      if (
        sectionId === "competencies" &&
        filled &&
        confidence.level === "medium"
      ) {
        continue;
      }

      // Learning context: ask specific missing field first
      if (sectionId === "learning_context" && !filled) {
        return uniqueQuestion(
          "capture_learning_context",
          "learning_context",
          confidence.level === "low" || confidence.level === "unknown",
          "Learning Context incomplete — one gap at a time.",
        );
      }

      if (!filled) {
        const objectiveId = OBJECTIVE_FOR_SECTION[sectionId];
        return uniqueQuestion(
          objectiveId,
          sectionId,
          confidence.level === "low",
          `Next mandatory section: ${sectionId}.`,
        );
      }

      if (confidence.level === "low") {
        return uniqueQuestion(
          "clarify_low_confidence",
          sectionId,
          true,
          `Low confidence on ${sectionId}.`,
        );
      }
    }
  }

  if (input.readyForApproval) {
    return uniqueQuestion(
      "confirm_ready",
      "validation",
      false,
      "Approval criteria met.",
    );
  }

  return uniqueQuestion(
    "capture_reflection",
    "reflection",
    false,
    "Continue discovery with remaining optional depth.",
  );
}
