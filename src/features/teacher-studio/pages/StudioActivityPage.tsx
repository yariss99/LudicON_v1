import { Link } from "react-router-dom";
import { useStudioActivityData } from "../context/TeacherStudioContext";
import type { ActivityKind } from "../types";

const LABELS: Record<ActivityKind, string> = {
  opened: "Deschis recent",
  edited: "Editat",
  ai_generated: "Generat de PRIMA",
  teacher_modified: "Modificat de tine",
  published: "Publicat",
};

export function StudioActivityPage() {
  const { items } = useStudioActivityData();

  return (
    <div>
      <header>
        <h1 className="ts-page-title">Activitate recentă</h1>
        <p className="ts-page-lead">
          Ce ai deschis, editat, generat sau publicat — fără zgomot inutil.
        </p>
      </header>

      <div className="ts-section ts-list">
        {items.length === 0 ? (
          <p className="ts-page-lead">Nu există activitate încă.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              to={item.projectId ? `/studio/${item.projectId}` : "/projects"}
              className="ts-row"
            >
              <div>
                <div className="ts-row-title">{item.title}</div>
                <div className="ts-row-meta">
                  {LABELS[item.kind]} · {item.detail}
                </div>
              </div>
              <span className="ts-chip">{item.timestampLabel}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
