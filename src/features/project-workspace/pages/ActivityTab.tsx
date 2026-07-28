import { formatRelativeTime } from "../../../utils/date";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";

const KIND_LABEL: Record<string, string> = {
  teacher_action: "Acțiune profesor",
  ai_action: "Acțiune AI",
  validation: "Validare",
  export: "Export",
  comment: "Comentariu",
  version: "Versiune",
};

export function ActivityTab() {
  const { activity } = useProjectWorkspace();

  if (activity.length === 0) {
    return (
      <EmptyState
        title="Activitate goală"
        description="Acțiunile profesorului, AI-ului, validările și exporturile apar aici."
      />
    );
  }

  return (
    <div>
      <p className="pw-lead">
        Cronologie: acțiuni profesor, acțiuni AI, rapoarte de validare, exporturi
        și comentarii.
      </p>
      <div className="pw-list">
        {activity.map((e) => (
          <div key={e.id} className="pw-row">
            <div className="pw-row-main">
              <div className="pw-row-title">{e.title}</div>
              <div className="pw-row-meta">
                {KIND_LABEL[e.kind] ?? e.kind} · {e.actor} · {e.detail} ·{" "}
                {formatRelativeTime(e.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
