import type { DecisionBlueprint } from "../../../engines/decision";
import { assetRegistry } from "./assetRegistry";
import type {
  AssetTypeId,
  GeneratedBlock,
  QualityReport,
} from "../types";

/**
 * QualityEvaluator — explains generation quality metrics.
 * Does not change Blueprint pedagogy.
 */
export function evaluateQuality(input: {
  typeId: AssetTypeId;
  blueprint: DecisionBlueprint;
  blocks: GeneratedBlock[];
}): QualityReport {
  const def = assetRegistry.get(input.typeId);
  const sections = def?.sourceSections ?? [];
  const covered = new Set(
    input.blocks.flatMap((b) => b.sourceSections),
  );
  const sectionHit = sections.filter((s) => covered.has(s)).length;
  const alignment =
    sections.length === 0 ? 0.7 : sectionHit / sections.length;

  const hasObjective = input.blueprint.objectives.length > 0;
  const hasContext = Boolean(
    input.blueprint.learningContext.subject &&
      input.blueprint.learningContext.topic,
  );
  const completeness = Math.min(
    1,
    (input.blocks.length / 3) * 0.5 +
      (hasObjective ? 0.25 : 0) +
      (hasContext ? 0.25 : 0),
  );

  const pedagogical =
    hasObjective && input.blocks.some((b) => b.sourceSections.includes("objectives"))
      ? 0.88
      : 0.55;

  const generationQuality = Math.min(
    1,
    (alignment + completeness + pedagogical) / 3 + 0.05,
  );
  const aiConfidence = Math.min(0.92, generationQuality + 0.04);

  const warnings: string[] = [];
  if (alignment < 0.7) {
    warnings.push(
      "Unele părți din proiectul lecției sunt încă puțin reprezentate în material.",
    );
  }
  if (!hasObjective) {
    warnings.push(
      "Obiectivele sunt încă subțiri — hai să le clarificăm împreună.",
    );
  }

  return {
    overall: Number(
      ((generationQuality + alignment + pedagogical + completeness + aiConfidence) /
        5).toFixed(2),
    ),
    warnings,
    evaluatedAt: new Date().toISOString(),
    metrics: [
      {
        id: "generation_quality",
        label: "Claritate didactică",
        score: generationQuality,
        explanation:
          "Cât de complet este materialul față de tipul ales pentru clasă.",
      },
      {
        id: "blueprint_alignment",
        label: "Aliniere la proiectul lecției",
        score: alignment,
        explanation:
          "Cât din părțile esențiale ale proiectului lecției apar în material.",
      },
      {
        id: "pedagogical_consistency",
        label: "Coerență pedagogică",
        score: pedagogical,
        explanation:
          "Obiectivele rămân ancora; materialul nu inventează o altă intenție.",
      },
      {
        id: "completeness",
        label: "Completitudine",
        score: completeness,
        explanation:
          "Destul conținut legat de plan ca să poți folosi materialul la clasă.",
      },
      {
        id: "ai_confidence",
        label: "Încredere în material",
        score: aiConfidence,
        explanation:
          "Cât de pregătit pare materialul pentru clasă — nu este o notă pentru tine.",
      },
    ],
  };
}
