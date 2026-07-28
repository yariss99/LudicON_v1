import type { PedagogicalFinding } from "../../types/pedagogy";
import type { PedagogicalDnaProfile } from "../../types/pedagogicalDna";

/**
 * Softly reorder pedagogical suggestions so DNA-aligned ideas appear first.
 * Never removes teacher agency. Never auto-applies anything.
 */
export function adaptFindingsToDna(
  findings: PedagogicalFinding[],
  profile: PedagogicalDnaProfile | null,
): PedagogicalFinding[] {
  if (!profile || findings.length === 0) return findings;

  const keywords = profile.patterns
    .filter((p) => p.presence !== "emerging")
    .flatMap((p) => p.label.toLowerCase().split(/\s+/));

  const scored = findings.map((finding, index) => {
    const text = `${finding.title} ${finding.detail}`.toLowerCase();
    const hits = keywords.filter((word) => word.length > 3 && text.includes(word)).length;
    return { finding, hits, index };
  });

  return scored
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .map(({ finding, hits }) =>
      hits > 0
        ? {
            ...finding,
            detail: `${finding.detail} Fits how you like to teach.`,
          }
        : finding,
    );
}
