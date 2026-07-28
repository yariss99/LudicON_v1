import { Link } from "react-router-dom";
import { ARTIFACT_KIND_LABEL } from "../constants";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { AssistantPanel } from "../../teacher-assistant/components/AssistantPanel";
import "../../teacher-assistant/styles/teacher-assistant.css";

export function AiSuggestionsTab() {
  const { suggestions, coreContext, generateWithAi } =
    useProjectWorkspace();

  return (
    <div>
      <div className="pw-context-banner" role="status">
        <span>
          <strong>Context proiect:</strong> {coreContext.projectTitle}
        </span>
        <span>
          <strong>Disciplină:</strong> {coreContext.subject}
        </span>
        <span>
          <strong>Clasă:</strong> {coreContext.grade}
        </span>
        <span>
          <strong>Tab:</strong> {coreContext.activeTab}
        </span>
      </div>

      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Sugestii PRIMA · Co-pilot
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Asistentul educațional înțelege proiectul, lecțiile și resursele —
            nu este un chatbot izolat.
          </p>
        </div>
        <div className="pw-header-actions">
          <Link className="pw-btn pw-btn-primary" to="/assistant">
            Deschide asistentul
          </Link>
        </div>
      </div>

      <div
        className="teacher-assistant"
        style={{
          border: "1px solid var(--pw-line, #e2e8f0)",
          borderRadius: 16,
          overflow: "hidden",
          minHeight: 420,
          marginBottom: "1.25rem",
        }}
      >
        <AssistantPanel compact />
      </div>

      <div className="pw-list">
        {suggestions.map((s) => (
          <div key={s.id} className="pw-row">
            <div className="pw-row-main">
              <div className="pw-row-title">{s.title}</div>
              <div className="pw-row-meta">{s.reason}</div>
            </div>
            <div className="pw-row-actions">
              {s.kind !== "general" ? (
                <button
                  type="button"
                  className="pw-btn"
                  onClick={() => {
                    const kind = s.kind;
                    if (kind === "general") return;
                    generateWithAi(
                      kind,
                      `${ARTIFACT_KIND_LABEL[kind] ?? kind} · AI`,
                    );
                  }}
                >
                  Generează aici
                </button>
              ) : null}
              <Link className="pw-btn pw-btn-primary" to={s.href}>
                {s.actionLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
