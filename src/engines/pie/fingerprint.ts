import type { PieAnalysisInput } from "./types";

/** Stable-enough fingerprint for change detection (not cryptographic). */
export function fingerprintPieInput(input: PieAnalysisInput): string {
  const payload = [
    input.lessonProjectId,
    input.title,
    input.subject,
    input.grade,
    String(input.availableMinutes),
    input.teachingStrategy ?? "",
    input.competencies.join("|"),
    input.learningObjectives.join("|"),
    input.learningFlow.join("|"),
    input.activities
      .map(
        (a) =>
          `${a.id}:${a.title}:${a.durationMinutes ?? ""}:${a.phase ?? ""}:${a.collaborative ? 1 : 0}`,
      )
      .join(";"),
    input.assessment.join("|"),
    (input.successCriteria ?? []).join("|"),
    input.resources.map((r) => `${r.id}:${r.label}`).join(";"),
    input.differentiation.join("|"),
    input.reflection.join("|"),
  ].join("::");

  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
  }
  return `pie_${hash.toString(16)}`;
}
