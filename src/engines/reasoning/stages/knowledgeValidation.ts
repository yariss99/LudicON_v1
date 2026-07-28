/**
 * AI-001 Step 4 — Knowledge Graph Validation
 * Consult Knowledge Engine for curriculum, competencies, objectives, dependencies.
 */

import type { KnowledgeEngineResults } from "../../decision/types";
import type {
  IntentDetectionResult,
  KnowledgePackage,
} from "../types";

export function validateKnowledgePackage(input: {
  knowledge?: KnowledgeEngineResults;
  intent: IntentDetectionResult;
}): KnowledgePackage {
  const raw: KnowledgeEngineResults = input.knowledge ?? {};
  const competencies = raw.competencyCandidates ?? [];
  const curriculum = raw.curriculumNotes ?? [];

  const pedagogicalDependencies: string[] = [];
  const entities = input.intent.detectedEntities;

  if (entities.topic && !entities.grade) {
    pedagogicalDependencies.push(
      "Grade is required before recommending curriculum-aligned competencies.",
    );
  }
  if (entities.grade && entities.subject && competencies.length === 0) {
    pedagogicalDependencies.push(
      "Competencies should be validated against curriculum once grade and subject are known.",
    );
  }

  return {
    curriculum,
    competencies,
    objectives: [],
    pedagogicalDependencies,
    raw: {
      competencyCandidates: competencies,
      curriculumNotes: curriculum,
    },
  };
}
