import { Link } from "react-router-dom";
import { AssistantPanel } from "./components/AssistantPanel";
import { useTeacherAssistant } from "./hooks/useTeacherAssistant";
import { formatRelativeTime } from "../../utils/date";
import "./styles/teacher-assistant.css";

export function TeacherAssistantPage() {
  const {
    conversations,
    selectConversation,
    newConversation,
    pinConversation,
    context,
  } = useTeacherAssistant();

  return (
    <div className="teacher-assistant ta-page">
      <header style={{ maxWidth: 1100, margin: "0 auto 1rem" }}>
        <p className="ta-kicker">
          <Link to="/" style={{ color: "inherit" }}>
            ← Studio
          </Link>
          {" · "}Teacher AI Assistant
        </p>
        <h1 className="ta-page-title">LudicON Copilot</h1>
        <p className="ta-lead">
          Sugestii, conversații și unelte — tu rămâi autorul materialului.
        </p>
        <div className="ta-meta" style={{ marginTop: "0.65rem" }}>
          <span className="ta-chip">{context.teacherName}</span>
          {context.projectTitle ? (
            <span className="ta-chip">{context.projectTitle}</span>
          ) : null}
          <span className="ta-chip">{context.workflowStage}</span>
        </div>
      </header>

      <div className="ta-page-shell">
        <aside className="ta-page-side">
          <div className="ta-header">
            <div>
              <strong>Istoric</strong>
              <p className="ta-kicker">Pin · search · rezumate</p>
            </div>
            <button
              type="button"
              className="ta-btn ta-btn-primary"
              onClick={() => newConversation("project")}
            >
              Nou
            </button>
          </div>
          <div className="ta-body">
            {conversations.map((c) => (
              <div key={c.id} className="ta-card">
                <button
                  type="button"
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                  }}
                  onClick={() => selectConversation(c.id)}
                >
                  <strong>
                    {c.pinned ? "📌 " : ""}
                    {c.title}
                  </strong>
                  <p>
                    {c.scope} · {formatRelativeTime(c.updatedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  className="ta-btn"
                  onClick={() => pinConversation(c.id)}
                >
                  Pin
                </button>
              </div>
            ))}
            {conversations.length === 0 ? (
              <div className="ta-empty">Începe o conversație.</div>
            ) : null}
          </div>
        </aside>
        <main className="ta-page-main">
          <AssistantPanel />
        </main>
      </div>
    </div>
  );
}

export default TeacherAssistantPage;
