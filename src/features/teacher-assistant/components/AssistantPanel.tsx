import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { ASSISTANT_VIEWS, WORKFLOW_STAGES } from "../constants";
import { useTeacherAssistant } from "../hooks/useTeacherAssistant";
import { documentKindLabel } from "../services/assistantSuggestions";
import type { AssistantViewId } from "../types";
import { useState } from "react";

const COMPACT_VIEWS: readonly AssistantViewId[] = [
  "chat",
  "proactive",
  "history",
];

const VIEW_LABELS: Partial<Record<AssistantViewId, string>> = {
  chat: "Conversație",
  proactive: "Ajutor",
  history: "Istoric",
};

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
    suggestionGroups,
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

  const views = compact
    ? ASSISTANT_VIEWS.filter((view) => COMPACT_VIEWS.includes(view.id))
    : ASSISTANT_VIEWS;

  const kind = documentKindLabel(context.documentKind);
  const stage = WORKFLOW_STAGES.find((w) => w.id === context.workflowStage)
    ?.label;
  const contextBits = [
    context.projectTitle,
    context.subject,
    context.grade,
    kind,
    !context.projectTitle ? stage : null,
  ].filter(Boolean);

  const hasMessages = Boolean(activeConversation?.messages.length);

  return (
    <div
      className="teacher-assistant ta-panel"
      aria-label="LudicON Copilot"
    >
      <div className="ta-header">
        <div>
          <h2 className="ta-title">LudicON Copilot</h2>
          <p className="ta-kicker">Tu decizi. Copilotul te sprijină.</p>
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
            <button
              type="button"
              className="ta-btn ta-btn-ghost"
              aria-label="Închide copilotul"
              onClick={onClose}
            >
              Închide
            </button>
          ) : null}
        </div>
      </div>

      <div className="ta-tabs" role="tablist" aria-label="Zonele Copilotului">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={viewId === v.id}
            className={["ta-tab", viewId === v.id ? "is-active" : ""].join(" ")}
            onClick={() => setViewId(v.id)}
          >
            {VIEW_LABELS[v.id] ?? v.label}
          </button>
        ))}
      </div>

      <div className="ta-body">
        <div className="ta-context">
          <p className="ta-context-line">
            {contextBits.length
              ? contextBits.join(" · ")
              : "Niciun proiect deschis"}
          </p>
          <p className="ta-context-hint">
            {context.projectTitle
              ? "Copilotul vede la ce lucrezi acum."
              : "Alege un proiect ca sugestiile să devină specifice."}
          </p>
        </div>

        {viewId === "chat" && (
          <>
            {!hasMessages ? (
              <div>
                <p className="ta-lead">Cum te pot ajuta acum?</p>
                {suggestionGroups.map((group) => (
                  <div key={group.id} className="ta-chip-group">
                    <p className="ta-chip-label">{group.label}</p>
                    <div className="ta-chip-row">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="ta-suggest"
                          onClick={() => sendMessage(item.prompt)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="ta-chip-row ta-chip-row-inline">
                  {suggestionGroups[0]?.items.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="ta-suggest is-compact"
                      onClick={() => sendMessage(item.prompt)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {activeConversation?.messages.map((m) => (
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
                ))}
              </>
            )}
          </>
        )}

        {viewId === "history" && (
          <>
            <input
              className="ta-input"
              placeholder="Caută conversații…"
              aria-label="Caută conversații"
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
              Sugestii pe care le poți ignora. Nimic nu se aplică fără tine.
            </p>
            {proactive.map((h) => (
              <div key={h.id} className="ta-card">
                <strong>{h.title}</strong>
                <p>{h.detail}</p>
                {h.href ? (
                  <Link className="ta-btn ta-btn-primary" to={h.href}>
                    Deschide
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="ta-btn"
                    onClick={() => sendMessage(h.title)}
                  >
                    Întreabă Copilotul
                  </button>
                )}
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
          <label className="ta-composer-label" htmlFor="ta-composer-input">
            Întreabă Copilotul
          </label>
          <textarea
            id="ta-composer-input"
            className="ta-textarea"
            value={draft}
            placeholder="Cu ce parte a proiectului vrei să te ajut?"
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
              Ajutor
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
