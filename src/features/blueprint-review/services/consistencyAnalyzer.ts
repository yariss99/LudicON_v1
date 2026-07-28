import { validateConsistency } from "../../../engines/decision/services/consistencyValidator";
import type { DecisionBlueprint } from "../../../engines/decision";
import type { ValidationIssue } from "../types";

/**
 * ConsistencyAnalyzer — wraps Decision Engine consistency checks for review UX.
 * Does not invent pedagogical rules outside the Decision Engine path.
 */
export async function analyzeConsistency(
  blueprint: DecisionBlueprint,
): Promise<{
  ok: boolean;
  issues: ValidationIssue[];
  notes: string[];
}> {
  const result = await validateConsistency(blueprint);
  const issues: ValidationIssue[] = result.contradictions.map((item) => ({
    id: item.id,
    sectionId:
      item.sectionId === "validation"
        ? "validation"
        : (item.sectionId as ValidationIssue["sectionId"]),
    severity: "blocking" as const,
    title: "Consistency conflict",
    explanation: item.description,
  }));

  for (const note of result.notes) {
    issues.push({
      id: `note_${note.slice(0, 24)}`,
      sectionId: "validation",
      severity: "warning",
      title: "Pedagogical note",
      explanation: note,
    });
  }

  return { ok: result.ok, issues, notes: result.notes };
}
