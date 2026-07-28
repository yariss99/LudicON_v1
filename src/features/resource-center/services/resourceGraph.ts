import type {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  KnowledgeResource,
} from "../types";

function nodeKindFromAsset(
  assetType: KnowledgeResource["assetType"],
): GraphNode["kind"] {
  switch (assetType) {
    case "lesson":
      return "lesson";
    case "worksheet":
      return "worksheet";
    case "assessment":
      return "assessment";
    case "story":
      return "story";
    case "game":
      return "game";
    case "presentation":
      return "presentation";
    default:
      return "resource";
  }
}

export function buildKnowledgeGraph(
  resources: readonly KnowledgeResource[],
  options?: { projectId?: string; focusId?: string; limit?: number },
): KnowledgeGraph {
  const limit = options?.limit ?? 80;
  const filtered = resources
    .filter((r) => !r.archived)
    .filter((r) =>
      options?.projectId ? r.projectId === options.projectId : true,
    )
    .slice(0, limit);

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const addNode = (node: GraphNode) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node);
  };

  for (const r of filtered) {
    addNode({
      id: r.id,
      kind: nodeKindFromAsset(r.assetType),
      label: r.name,
      meta: `${r.assetType} · ${r.subject}`,
    });

    if (r.projectId) {
      const pid = `project:${r.projectId}`;
      addNode({
        id: pid,
        kind: "project",
        label: r.projectTitle || r.projectId,
        meta: "project",
      });
      edges.push({
        id: `${pid}->${r.id}`,
        from: pid,
        to: r.id,
        kind: "contains",
        weight: 1,
      });
    }

    if (r.lessonId) {
      const lid = r.relations.find((x) => x.kind === "belongs_to_lesson")
        ?.targetId
        ? r.relations.find((x) => x.kind === "belongs_to_lesson")!.targetId
        : `lesson:${r.lessonId}`;
      addNode({
        id: lid.startsWith("rc:") ? lid : `rc:lesson:${r.lessonId}`,
        kind: "lesson",
        label: r.lessonTitle || r.lessonId,
        meta: "lesson",
      });
      edges.push({
        id: `${r.id}->lesson`,
        from: r.id,
        to: lid.startsWith("rc:") ? lid : `rc:lesson:${r.lessonId}`,
        kind: "belongs_to_lesson",
        weight: 0.9,
      });
    }

    const teacherId = `teacher:${r.author}`;
    addNode({
      id: teacherId,
      kind: "teacher",
      label: r.author,
      meta: "teacher",
    });
    edges.push({
      id: `${teacherId}->${r.id}`,
      from: teacherId,
      to: r.id,
      kind: "authored_by",
      weight: 0.5,
    });

    for (const c of r.competencies.slice(0, 4)) {
      const cid = `comp:${c}`;
      addNode({ id: cid, kind: "competency", label: c, meta: "competency" });
      edges.push({
        id: `${r.id}->${cid}`,
        from: r.id,
        to: cid,
        kind: "supports_competency",
        weight: 0.7,
      });
    }

    for (const relation of r.relations.slice(0, 8)) {
      addNode({
        id: relation.targetId,
        kind:
          relation.kind === "supports_competency"
            ? "competency"
            : relation.kind === "belongs_to_project"
              ? "project"
              : relation.kind === "belongs_to_lesson"
                ? "lesson"
                : "resource",
        label: relation.targetLabel,
      });
      edges.push({
        id: relation.id,
        from: r.id,
        to: relation.targetId,
        kind: relation.kind,
        weight: relation.strength,
      });
    }
  }

  if (options?.focusId && nodes.has(options.focusId)) {
    // keep all; focus is visual in UI
  }

  return { nodes: Array.from(nodes.values()), edges };
}
