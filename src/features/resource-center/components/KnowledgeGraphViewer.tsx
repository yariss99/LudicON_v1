import { useMemo } from "react";
import { useResourceCenter } from "../hooks/useResourceCenter";
import type { GraphNodeKind } from "../types";

const KIND_COLOR: Record<GraphNodeKind, string> = {
  project: "#1d4ed8",
  lesson: "#0f766e",
  worksheet: "#0369a1",
  assessment: "#b45309",
  story: "#c2410c",
  game: "#7c3aed",
  presentation: "#4338ca",
  competency: "#047857",
  resource: "#475569",
  teacher: "#9f1239",
};

export function KnowledgeGraphViewer() {
  const { graph, selectResource, selectedId } = useResourceCenter();

  const layout = useMemo(() => {
    const width = 900;
    const height = 520;
    const cx = width / 2;
    const cy = height / 2;
    const nodes = graph.nodes.slice(0, 48);
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, i) => {
      const ring =
        node.kind === "project"
          ? 0
          : node.kind === "lesson"
            ? 1
            : node.kind === "competency" || node.kind === "teacher"
              ? 3
              : 2;
      const count = Math.max(
        1,
        nodes.filter((n) => {
          const r =
            n.kind === "project"
              ? 0
              : n.kind === "lesson"
                ? 1
                : n.kind === "competency" || n.kind === "teacher"
                  ? 3
                  : 2;
          return r === ring;
        }).length,
      );
      const idx = nodes
        .filter((n) => {
          const r =
            n.kind === "project"
              ? 0
              : n.kind === "lesson"
                ? 1
                : n.kind === "competency" || n.kind === "teacher"
                  ? 3
                  : 2;
          return r === ring;
        })
        .findIndex((n) => n.id === node.id);
      const radius = 40 + ring * 95;
      const angle = (Math.PI * 2 * (idx < 0 ? i : idx)) / count - Math.PI / 2;
      positions.set(node.id, {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    });
    return { width, height, positions, nodes };
  }, [graph.nodes]);

  return (
    <div className="rc-graph" aria-label="Knowledge graph">
      <svg
        className="rc-graph-svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
      >
        {graph.edges.map((edge) => {
          const from = layout.positions.get(edge.from);
          const to = layout.positions.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#cbd5e1"
              strokeWidth={Math.max(1, edge.weight * 2)}
            />
          );
        })}
        {layout.nodes.map((node) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;
          const active = selectedId === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (node.id.startsWith("rc:")) selectResource(node.id);
              }}
            >
              <circle
                r={active ? 16 : 12}
                fill={KIND_COLOR[node.kind]}
                opacity={0.9}
              />
              <text
                y={28}
                textAnchor="middle"
                fontSize="10"
                fill="#334155"
              >
                {node.label.slice(0, 22)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="rc-graph-legend">
        {(Object.keys(KIND_COLOR) as GraphNodeKind[]).map((kind) => (
          <span key={kind} className="rc-chip">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: KIND_COLOR[kind],
                display: "inline-block",
                marginRight: 4,
              }}
            />
            {kind}
          </span>
        ))}
      </div>
      <div className="rc-kicker" style={{ marginTop: "0.5rem" }}>
        {graph.nodes.length} noduri · {graph.edges.length} relații
      </div>
    </div>
  );
}
