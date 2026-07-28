import type {
  KnowledgeEdge,
  KnowledgeNode,
  KnowledgeRecommendation,
  PedagogicalPattern,
  KnowledgeTimelinePoint,
} from "./types";

export function recommendForContext(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  context: {
    subject?: string;
    grade?: string;
    topicText?: string;
    strategy?: string;
  },
): KnowledgeRecommendation[] {
  const recs: KnowledgeRecommendation[] = [];

  for (const node of nodes) {
    let score = 0;
    const reasons: string[] = [];
    if (context.subject && node.subject === context.subject) {
      score += 3;
      reasons.push("aceeași disciplină");
    }
    if (context.grade && node.grade === context.grade) {
      score += 3;
      reasons.push("aceeași clasă");
    }
    if (
      context.strategy &&
      (node.strategy === context.strategy ||
        node.tags.includes(context.strategy))
    ) {
      score += 4;
      reasons.push("strategie potrivită");
    }
    if (
      context.topicText &&
      `${node.title} ${node.summary}`
        .toLowerCase()
        .includes(context.topicText.toLowerCase())
    ) {
      score += 5;
      reasons.push("temă similară");
    }
    if (node.kind === "template") score += 1;
    if (node.kind === "lesson_design") score += 1;
    if (score < 3) continue;

    recs.push({
      id: `rec_${node.id}`,
      nodeId: node.id,
      title: node.title,
      reason: reasons.join(" · "),
      score,
      kind: node.kind,
    });
  }

  // Boost nodes connected to reflections (improved lessons)
  for (const edge of edges) {
    if (edge.kind === "improves" && edge.status === "active") {
      const hit = recs.find((r) => r.nodeId === edge.fromId);
      if (hit) {
        hit.score += 2;
        hit.reason += " · îmbunătățită după reflecție";
      }
    }
  }

  return recs.sort((a, b) => b.score - a.score).slice(0, 12);
}

export function detectPatterns(nodes: KnowledgeNode[]): PedagogicalPattern[] {
  const patterns: PedagogicalPattern[] = [];
  const patternNodes = nodes.filter((n) => n.kind === "pattern");
  for (const p of patternNodes) {
    patterns.push({
      id: p.id,
      title: p.title,
      description: p.summary,
      structureHints: p.tags,
      evidenceCount: 1,
      templateNodeId: nodes.find(
        (n) => n.kind === "template" && n.tags.some((t) => p.tags.includes(t)),
      )?.id,
    });
  }

  const coopCount = nodes.filter(
    (n) => n.strategy === "cooperative" || n.tags.includes("cooperativ"),
  ).length;
  if (coopCount >= 2) {
    patterns.push({
      id: "pat_coop_sequence",
      title: "Secvență cooperativă reutilizată",
      description:
        "Explorare în perechi urmată de practică — apare des în baza ta.",
      structureHints: [
        "deschidere scurtă",
        "explorare în perechi",
        "practică",
        "exit ticket",
      ],
      evidenceCount: coopCount,
      templateNodeId: nodes.find((n) => n.id === "kn_tpl_coop_math")?.id,
    });
  }

  return patterns;
}

export function knowledgeTimeline(
  nodes: KnowledgeNode[],
): KnowledgeTimelinePoint[] {
  const sorted = [...nodes].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return sorted.slice(0, 10).map((n, index) => ({
    id: `tl_${n.id}`,
    labelRo:
      index === 0
        ? `Recent: ${n.title}`
        : n.kind === "reflection_note"
          ? `Reflecție: ${n.title}`
          : n.title,
    at: n.updatedAt,
    relatedNodeIds: [n.id],
  }));
}
