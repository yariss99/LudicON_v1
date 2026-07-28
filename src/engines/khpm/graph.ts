import type { KnowledgeEdge, KnowledgeNode } from "./types";

export function neighbors(
  nodeId: string,
  edges: KnowledgeEdge[],
  direction: "out" | "in" | "both" = "both",
): string[] {
  const ids = new Set<string>();
  for (const edge of edges) {
    if (edge.status === "rejected") continue;
    if (edge.status === "pending") continue;
    if ((direction === "out" || direction === "both") && edge.fromId === nodeId) {
      ids.add(edge.toId);
    }
    if ((direction === "in" || direction === "both") && edge.toId === nodeId) {
      ids.add(edge.fromId);
    }
  }
  return [...ids];
}

export function traverse(
  startId: string,
  edges: KnowledgeEdge[],
  maxDepth = 4,
): string[] {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [
    { id: startId, depth: 0 },
  ];
  while (queue.length) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > maxDepth) continue;
    visited.add(current.id);
    for (const n of neighbors(current.id, edges, "both")) {
      if (!visited.has(n)) queue.push({ id: n, depth: current.depth + 1 });
    }
  }
  return [...visited];
}

export function pathLabels(
  nodeIds: string[],
  nodes: KnowledgeNode[],
): string[] {
  return nodeIds
    .map((id) => nodes.find((n) => n.id === id)?.title)
    .filter((t): t is string => Boolean(t));
}

export function suggestSemanticLinks(
  nodes: KnowledgeNode[],
  existing: KnowledgeEdge[],
): KnowledgeEdge[] {
  const existingKeys = new Set(
    existing.map((e) => `${e.kind}:${e.fromId}->${e.toId}`),
  );
  const suggestions: KnowledgeEdge[] = [];
  const now = new Date().toISOString();

  for (const a of nodes) {
    for (const b of nodes) {
      if (a.id === b.id) continue;
      const sameObjective =
        a.objectiveIds?.some((id) => b.objectiveIds?.includes(id)) ?? false;
      const sameCompetency =
        a.competencyIds?.some((id) => b.competencyIds?.includes(id)) ?? false;
      const similarTags =
        a.tags.filter((t) => b.tags.includes(t)).length >= 2;

      if (
        (sameObjective || sameCompetency || similarTags) &&
        a.kind !== b.kind
      ) {
        const key = `suggested:${a.id}->${b.id}`;
        if (existingKeys.has(key) || existingKeys.has(`similar_to:${a.id}->${b.id}`)) {
          continue;
        }
        suggestions.push({
          id: `sug_${a.id}_${b.id}`,
          kind: "suggested",
          fromId: a.id,
          toId: b.id,
          label: sameObjective
            ? "Aceleași obiective"
            : sameCompetency
              ? "Aceeași competență"
              : "Etichete comune",
          status: "pending",
          createdAt: now,
        });
        existingKeys.add(key);
      }
    }
  }

  return suggestions.slice(0, 20);
}
