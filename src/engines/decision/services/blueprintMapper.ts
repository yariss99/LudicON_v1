import type {
  BlueprintSectionFacts,
  BlueprintSectionId,
  DecisionBlueprint,
  ExtractedPedagogicalInfo,
  KnowledgeEngineResults,
  LearningContextFacts,
  MemoryEnginePreferences,
  TeacherCorrection,
} from "../types";

function mergeContext(
  current: LearningContextFacts,
  next?: LearningContextFacts,
): LearningContextFacts {
  if (!next) return current;
  return {
    grade: next.grade ?? current.grade,
    subject: next.subject ?? current.subject,
    topic: next.topic ?? current.topic,
    durationMinutes: next.durationMinutes ?? current.durationMinutes,
    language: next.language ?? current.language,
    summary: next.summary ?? current.summary,
  };
}

function appendUnique(list: string[], items?: string[]): string[] {
  if (!items?.length) return list;
  const out = [...list];
  for (const item of items) {
    const normalized = item.toLowerCase();
    if (!out.some((entry) => entry.toLowerCase() === normalized)) {
      out.push(item);
    }
  }
  return out;
}

function fingerprint(blueprint: DecisionBlueprint): string {
  return JSON.stringify({
    learningContext: blueprint.learningContext,
    competencies: blueprint.competencies,
    objectives: blueprint.objectives,
    learningFlow: blueprint.learningFlow,
    activities: blueprint.activities,
    assessment: blueprint.assessment,
    resources: blueprint.resources,
    differentiation: blueprint.differentiation,
    reflection: blueprint.reflection,
  });
}

function sectionChanged(
  before: DecisionBlueprint,
  after: DecisionBlueprint,
  id: BlueprintSectionId,
): boolean {
  switch (id) {
    case "learning_context":
      return (
        JSON.stringify(before.learningContext) !==
        JSON.stringify(after.learningContext)
      );
    case "competencies":
      return before.competencies.join("|") !== after.competencies.join("|");
    case "objectives":
      return before.objectives.join("|") !== after.objectives.join("|");
    case "learning_flow":
      return before.learningFlow.join("|") !== after.learningFlow.join("|");
    case "activities":
      return before.activities.join("|") !== after.activities.join("|");
    case "assessment":
      return before.assessment.join("|") !== after.assessment.join("|");
    case "resources":
      return before.resources.join("|") !== after.resources.join("|");
    case "differentiation":
      return (
        before.differentiation.join("|") !== after.differentiation.join("|")
      );
    case "reflection":
      return before.reflection.join("|") !== after.reflection.join("|");
    case "validation":
      return false;
  }
}

/**
 * Blueprint Mapper — maps extracted info onto Blueprint sections.
 * Teacher corrections override assumptions immediately.
 */
export async function mapToBlueprint(input: {
  blueprint: DecisionBlueprint;
  extracted: ExtractedPedagogicalInfo;
  knowledge?: KnowledgeEngineResults;
  memory?: MemoryEnginePreferences;
  preferInference: boolean;
}): Promise<{
  blueprint: DecisionBlueprint;
  updatedSections: BlueprintSectionId[];
}> {
  const before = structuredClone(input.blueprint);
  const next: DecisionBlueprint = structuredClone(input.blueprint);
  const facts = input.extracted.facts;

  next.learningContext = mergeContext(
    next.learningContext,
    facts.learningContext,
  );

  // Memory defaults only when field empty — never override teacher
  if (input.memory?.preferredDurationMinutes && !next.learningContext.durationMinutes) {
    next.learningContext.durationMinutes = input.memory.preferredDurationMinutes;
    next.assumptions.learning_context = [
      ...(next.assumptions.learning_context ?? []),
      `Assumed duration ${input.memory.preferredDurationMinutes}m from Memory`,
    ];
  }
  if (input.memory?.preferredLanguage && !next.learningContext.language) {
    next.learningContext.language = input.memory.preferredLanguage;
  }

  next.competencies = appendUnique(next.competencies, facts.competencies);
  next.objectives = appendUnique(next.objectives, facts.objectives);
  next.learningFlow = appendUnique(next.learningFlow, facts.learningFlow);
  next.activities = appendUnique(next.activities, facts.activities);
  next.assessment = appendUnique(next.assessment, facts.assessment);
  next.resources = appendUnique(next.resources, facts.resources);
  next.differentiation = appendUnique(
    next.differentiation,
    facts.differentiation,
  );
  next.reflection = appendUnique(next.reflection, facts.reflection);

  // Prefer inference: suggest competency from context when empty
  if (
    input.preferInference &&
    next.competencies.length === 0 &&
    next.learningContext.subject &&
    next.learningContext.topic &&
    input.knowledge?.competencyCandidates?.[0]
  ) {
    const assumed = input.knowledge.competencyCandidates[0];
    next.competencies = [assumed];
    next.assumptions.competencies = [
      ...(next.assumptions.competencies ?? []),
      `Assumed competency from Knowledge: ${assumed}`,
    ];
  } else if (
    input.preferInference &&
    next.competencies.length === 0 &&
    next.learningContext.subject &&
    next.learningContext.topic
  ) {
    const assumed = `Apply ${next.learningContext.subject} understanding of ${next.learningContext.topic}`;
    next.competencies = [assumed];
    next.assumptions.competencies = [
      ...(next.assumptions.competencies ?? []),
      "Assumed competency from Learning Context (inference)",
    ];
  }

  // Teacher corrections override assumptions
  for (const correction of input.extracted.corrections) {
    applyCorrection(next, correction);
  }

  // Lost scaffold — soft assumption only for subject/grade if empty
  if (input.extracted.lost) {
    if (!next.learningContext.subject) {
      next.learningContext.subject = "Matematică";
      next.assumptions.learning_context = [
        ...(next.assumptions.learning_context ?? []),
        "Assumed Matematică while teacher explores ideas",
      ];
    }
    if (!next.learningContext.grade) {
      next.learningContext.grade = "Clasa a III-a";
      next.assumptions.learning_context = [
        ...(next.assumptions.learning_context ?? []),
        "Assumed Clasa a III-a while teacher explores ideas",
      ];
    }
  }

  void fingerprint(before);

  const sectionIds: BlueprintSectionId[] = [
    "learning_context",
    "competencies",
    "objectives",
    "learning_flow",
    "activities",
    "assessment",
    "resources",
    "differentiation",
    "reflection",
  ];

  const updatedSections = sectionIds.filter((id) =>
    sectionChanged(before, next, id),
  );

  return { blueprint: next, updatedSections };
}

function applyCorrection(
  blueprint: DecisionBlueprint,
  correction: TeacherCorrection,
): void {
  blueprint.correctionsApplied = [
    ...blueprint.correctionsApplied,
    correction,
  ];

  // Clear assumptions for that section — teacher authority
  blueprint.assumptions[correction.sectionId] = [];

  const value = correction.newValue;
  if (correction.sectionId === "learning_context") {
    if (correction.field === "grade") {
      blueprint.learningContext.grade = value;
      return;
    }
    if (correction.field === "subject") {
      blueprint.learningContext.subject = value;
      return;
    }
    if (correction.field === "topic") {
      blueprint.learningContext.topic = value;
      return;
    }
    if (/clasa|grade|class/i.test(value)) {
      blueprint.learningContext.grade = value;
    } else if (/math|matem|științ|român|istor|geograf/i.test(value)) {
      blueprint.learningContext.subject = value;
    } else {
      blueprint.learningContext.topic = value;
    }
    return;
  }

  const key = sectionListKey(correction.sectionId);
  if (key) {
    blueprint[key] = [value];
  }
}

function sectionListKey(
  id: BlueprintSectionId,
): keyof BlueprintSectionFacts | null {
  switch (id) {
    case "competencies":
      return "competencies";
    case "objectives":
      return "objectives";
    case "learning_flow":
      return "learningFlow";
    case "activities":
      return "activities";
    case "assessment":
      return "assessment";
    case "resources":
      return "resources";
    case "differentiation":
      return "differentiation";
    case "reflection":
      return "reflection";
    default:
      return null;
  }
}

export function createEmptyBlueprint(): DecisionBlueprint {
  return {
    learningContext: {},
    competencies: [],
    objectives: [],
    learningFlow: [],
    activities: [],
    assessment: [],
    resources: [],
    differentiation: [],
    reflection: [],
    assumptions: {},
    correctionsApplied: [],
  };
}
