import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { ASSISTANT_VIEWS, WORKFLOW_STAGES } from "../constants";
import { useTeacherAssistant } from "../hooks/useTeacherAssistant";
import { useState } from "react";

export function AssistantPanel({
  onClose,
  compact,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const {
    context,
    activeConversation,
    viewId,
    setViewId,
    conversations,
    historyQuery,
    setHistoryQuery,
    proactive,
    memory,
    lastPrompt,
    sending,
    examplePrompts,
    sendMessage,
    newConversation,
    selectConversation,
    pinConversation,
    archiveConversation,
    summarizeActive,
    rememberNote,
  } = useTeacherAssistant();
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="teacher-assistant ta-panel" aria-label="Teacher AI Assistant">
      <div className="ta-header">
        <div>
          <h2 className="ta-title">PRIMA Co-pilot</h2>
          <p className="ta-kicker">
            Nu este chatbot · context + unelte + Validation Engine
          </p>
        </div>
        <div className="ta-actions">
          <button
            type="button"
            className="ta-btn"
            onClick={() => newConversation("project")}
          >
            Nou
          </button>
          {onClose ? (
            <button type="button" className="ta-btn ta-btn-ghost" onClick={onClose}>
              Închide
            </button>
          ) : null}
        </div>
      </div>

      <div className="ta-tabs" role="tablist">
        {ASSISTANT_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            className={["ta-tab", viewId === v.id ? "is-active" : ""].join(" ")}
            onClick={() => setViewId(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="ta-body">
        <div className="ta-meta">
          <span className="ta-chip">{context.teacherName}</span>
          {context.projectTitle ? (
            <span className="ta-chip">{context.projectTitle}</span>
          ) : null}
          {context.lessonTitle ? (
            <span className="ta-chip">{context.lessonTitle}</span>
          ) : null}
          {context.documentKind ? (
            <span className="ta-chip">{context.documentKind}</span>
          ) : null}
          <span className="ta-chip">
            {WORKFLOW_STAGES.find((w) => w.id === context.workflowStage)?.label}
          </span>
          <span className="ta-chip">{context.subject}</span>
          <span className="ta-chip">{context.grade}</span>
        </div>

        {viewId === "chat" && (
          <>
            {!activeConversation?.messages.length ? (
              <div>
                <p className="ta-lead">
                  Scrie în limbaj natural. Exemplu: „Transformă lecția în joc”.
                </p>
                <div className="ta-examples">
                  {examplePrompts.slice(0, compact ? 4 : 7).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="ta-example"
                      onClick={() => sendMessage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConversation.messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "ta-msg",
                    m.role === "teacher" ? "ta-msg-teacher" : "ta-msg-assistant",
                    m.blocked ? "ta-msg-blocked" : "",
                  ].join(" ")}
                >
                  {m.content}
                  {m.toolCalls?.length ? (
                    <div className="ta-tools">
                      {m.toolCalls.map((t) =>
                        t.href ? (
                          <Link key={t.id} className="ta-tool" to={t.href}>
                            <span>{t.label}</span>
                            <span className="ta-chip">{t.status}</span>
                          </Link>
                        ) : (
                          <div key={t.id} className="ta-tool">
                            <span>{t.label}</span>
                            <span className="ta-chip">{t.status}</span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}
                  {m.validation ? (
                    <div
                      className={[
                        "ta-validation",
                        m.validation.passed ? "is-ok" : "is-bad",
                      ].join(" ")}
                    >
                      Validation Engine · scor {m.validation.score}
                      {m.blocked ? " · blocat" : " · livrat"}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </>
        )}

        {viewId === "history" && (
          <>
            <input
              className="ta-input"
              placeholder="Caută conversații…"
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
            />
            {conversations.length === 0 ? (
              <div className="ta-empty">Nicio conversație încă.</div>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className="ta-card">
                  <strong>
                    {c.pinned ? "📌 " : ""}
                    {c.title}
                  </strong>
                  <p>
                    {c.scope} · {formatRelativeTime(c.updatedAt)}
                    {c.summary ? ` · ${c.summary}` : ""}
                  </p>
                  <div className="ta-actions" style={{ marginTop: "0.45rem" }}>
                    <button
                      type="button"
                      className="ta-btn ta-btn-primary"
                      onClick={() => selectConversation(c.id)}
                    >
                      Deschide
                    </button>
                    <button
                      type="button"
                      className="ta-btn"
                      onClick={() => pinConversation(c.id)}
                    >
                      {c.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      type="button"
                      className="ta-btn ta-btn-danger"
                      onClick={() => archiveConversation(c.id)}
                    >
                      Arhivează
                    </button>
                  </div>
                </div>
              ))
            )}
            {activeConversation ? (
              <button
                type="button"
                className="ta-btn"
                onClick={summarizeActive}
              >
                Generează rezumat conversație
              </button>
            ) : null}
          </>
        )}

        {viewId === "context" && (
          <pre className="ta-pre">{JSON.stringify(context, null, 2)}</pre>
        )}

        {viewId === "proactive" && (
          <>
            <p className="ta-lead">
              Sugestii proactive pe baza proiectului, competențelor și
              artefactelor.
            </p>
            {proactive.map((h) => (
              <div key={h.id} className="ta-card">
                <strong>{h.title}</strong>
                <p>{h.detail}</p>
                {h.href ? (
                  <Link className="ta-btn ta-btn-primary" to={h.href}>
                    Deschide
                  </Link>
                ) : null}
              </div>
            ))}
          </>
        )}

        {viewId === "memory" && (
          <>
            <div className="ta-card">
              <strong>Stil</strong>
              <p>{memory.styleNotes.join(" · ") || "—"}</p>
            </div>
            <div className="ta-card">
              <strong>Formate preferate</strong>
              <p>{memory.preferredFormats.join(" · ") || "—"}</p>
            </div>
            <div className="ta-card">
              <strong>Workflow-uri frecvente</strong>
              <p>{memory.frequentWorkflows.join(" · ") || "—"}</p>
            </div>
            <div className="ta-actions">
              <button
                type="button"
                className="ta-btn"
                onClick={() => {
                  const v = window.prompt("Notă stil didactic");
                  if (v) rememberNote("style", v);
                }}
              >
                + Stil
              </button>
              <button
                type="button"
                className="ta-btn"
                onClick={() => {
                  const v = window.prompt("Format preferat");
                  if (v) rememberNote("format", v);
                }}
              >
                + Format
              </button>
              <button
                type="button"
                className="ta-btn"
                onClick={() => {
                  const v = window.prompt("Feedback / notă");
                  if (v) rememberNote("feedback", v);
                }}
              >
                + Feedback
              </button>
            </div>
          </>
        )}

        {viewId === "tools" && (
          <>
            <p className="ta-lead">
              Orchestrare PRIMA Core — prompt + engines + tool calls.
            </p>
            {lastPrompt ? (
              <>
                <div className="ta-meta">
                  {lastPrompt.engines.map((e) => (
                    <span key={e} className="ta-chip">
                      {e}
                    </span>
                  ))}
                </div>
                <pre className="ta-pre">{lastPrompt.user}</pre>
              </>
            ) : (
              <div className="ta-empty">Trimite un mesaj pentru a vedea promptul.</div>
            )}
            <Link className="ta-btn" to="/resource-center">
              Resource Center
            </Link>
            <Link className="ta-btn" to="/assistant">
              Pagina asistent
            </Link>
          </>
        )}
      </div>

      {viewId === "chat" ? (
        <div className="ta-composer">
          <textarea
            className="ta-textarea"
            value={draft}
            placeholder="Ex: Creează o fișă diferențiată pentru lecția curentă…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="ta-actions">
            <button
              type="button"
              className="ta-btn ta-btn-primary"
              disabled={sending || !draft.trim()}
              onClick={submit}
            >
              {sending ? "Se validează…" : "Trimite"}
            </button>
            <button
              type="button"
              className="ta-btn"
              onClick={() => setViewId("proactive")}
            >
              Proactiv
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
