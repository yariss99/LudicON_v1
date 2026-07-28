import type { DecisionBlueprint } from "../../../engines/decision";
import type {
  AlignmentIssue,
  AlignmentReport,
  AlignmentStatus,
  StudioNode,
} from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * AlignmentService — live Blueprint integrity checks on every edit.
 * Does not silently rewrite pedagogy.
 */
export function checkAlignment(
  nodes: StudioNode[],
  blueprint: DecisionBlueprint,
): AlignmentReport {
  const issues: AlignmentIssue[] = [];
  const objectives = blueprint.objectives.map((o) => o.toLowerCase());
  const topic = (blueprint.learningContext.topic ?? "").toLowerCase();
  const subject = (blueprint.learningContext.subject ?? "").toLowerCase();

  for (const node of nodes) {
    const body = node.body.toLowerCase();

    // Conflict: node claims objectives source but contradicts topic/subject language
    if (
      node.sourceSections.includes("objectives") &&
      objectives.length > 0 &&
      body.length > 20
    ) {
      const mentionsObjective = objectives.some(
        (obj) =>
          body.includes(obj.slice(0, Math.min(18, obj.length))) ||
          obj.includes(body.slice(0, 18)),
      );
      const offTopic =
        /photosynth|noun grammar|world war/i.test(node.body) &&
        (subject.includes("matem") || topic.includes("fraction"));
      if (offTopic) {
        issues.push({
          id: uid("align"),
          nodeId: node.id,
          status: "conflict",
          message: `„${node.title}” pare să nu se potrivească cu contextul lecției.`,
          suggestion:
            "Revizuiește textul sau actualizează proiectul lecției împreună cu PRIMA.",
        });
      } else if (!mentionsObjective && /students (will|can)|objective/i.test(node.body)) {
        issues.push({
          id: uid("align"),
          nodeId: node.id,
          status: "warning",
          message: `„${node.title}” s-ar putea îndepărta de obiectivele confirmate.`,
          suggestion: "Rămâi mai aproape de formularea obiectivelor confirmate.",
        });
      }
    }

    // Warning: emptied a Blueprint-linked section
    if (node.sourceSections.length > 0 && node.body.trim().length < 3) {
      issues.push({
        id: uid("align"),
        nodeId: node.id,
        status: "warning",
        message: `„${node.title}” este legat de proiectul lecției, dar este aproape gol.`,
        suggestion: "Restaurează conținutul sau marchează intenționat că păstrezi forma actuală.",
      });
    }

    // Conflict: removes topic while context-linked
    if (
      node.sourceSections.includes("learning_context") &&
      topic &&
      body.length > 10 &&
      !body.includes(topic) &&
      /about|topic|explore/i.test(node.body)
    ) {
      issues.push({
        id: uid("align"),
        nodeId: node.id,
        status: "warning",
        message: `„${node.title}” nu mai menționează tema „${blueprint.learningContext.topic}”.`,
        suggestion: "Reintroduce tema sau revizuiește cu grijă.",
      });
    }
  }

  const status: AlignmentStatus = issues.some((i) => i.status === "conflict")
    ? "conflict"
    : issues.some((i) => i.status === "warning")
      ? "warning"
      : "aligned";

  return {
    status,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

export function nodeAlignment(
  report: AlignmentReport | null,
  nodeId: string,
): AlignmentStatus {
  if (!report) return "unknown";
  const issue = report.issues.find((i) => i.nodeId === nodeId);
  return issue?.status ?? "aligned";
}
