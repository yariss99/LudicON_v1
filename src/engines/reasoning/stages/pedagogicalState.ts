/**
 * AI-001 Step 6 — Pedagogical State Update
 * Classify what is known, inferred, required, optional, completed, needs review.
 */

import type {
  BlueprintSectionId,
  ConfidenceMap,
  MissingInformationItem,
} from "../../decision/types";
import type {
  PedagogicalFactStatus,
  PedagogicalStatePackage,
} from "../types";

function toStatus(item: MissingInformationItem): PedagogicalFactStatus {
  switch (item.kind) {
    case "known":
      return "known";
    case "assumed":
      return "inferred";
    case "missing":
      return "required";
    case "contradictory":
      return "needs_review";
    default:
      return "optional";
  }
}

export function updatePedagogicalState(input: {
  confidenceMap: ConfidenceMap;
  missingInformation: MissingInformationItem[];
}): PedagogicalStatePackage {
  const statuses: PedagogicalStatePackage["statuses"] =
    input.missingInformation.map((item) => ({
      id: item.id,
      sectionId: item.sectionId,
      status: toStatus(item),
      description: item.description,
    }));

  for (const sectionId of Object.keys(input.confidenceMap) as BlueprintSectionId[]) {
    const field = input.confidenceMap[sectionId];
    if (field.level === "high" && field.score >= 0.85) {
      const already = statuses.some(
        (s) => s.sectionId === sectionId && s.status === "completed",
      );
      if (
        !already &&
        !statuses.some((s) => s.sectionId === sectionId && s.status === "required")
      ) {
        statuses.push({
          id: `completed:${sectionId}`,
          sectionId,
          status: "completed",
          description: `${sectionId} has sufficient pedagogical confidence.`,
        });
      }
    }
  }

  return {
    statuses,
    confidenceMap: input.confidenceMap,
    missingInformation: input.missingInformation,
  };
}
