import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { QUICK_ACTIONS } from "../constants";
import { useAiCopilot } from "../hooks/useAiCopilot";
import { MarkdownContent } from "./MarkdownContent";
import { ResponseCard } from "./ResponseCard";

type PanelTab = "assist" | "history" | "prompts";

export function AiCopilotPanel() {
  const {
    panelMode,
    expand,
    collapse,
    pin,
    hide,
    context,
    messages,
    conversations,
    prompts,
    smartPrompts,
    busy,
    ask,
    runQuickAction,
    togglePinPrompt,
    loadConversation,
    newConversation,
  } = useAiCopilot();

  const [tab, setTab] = useState<PanelTab>("assist");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const historyGroups = useMemo(() => {
    const map = new Map<string, typeof conversations>();
    for (const c of conversations) {
      const key = c.projectName || "Global";
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [conversations]);

  const recentPrompts = useMemo(
    () =>
      [...prompts].sort(
        (a, b) => Date.parse(b.lastUsedAt) - Date.parse(a.lastUsedAt),
      ),
    [prompts],
  );
  const pinnedPrompts = recentPrompts.filter((p) => p.pinned);

  if (panelMode === "hidden") return null;

  if (panelMode === "collapsed") {
    return (
      <aside className="ac-panel is-collapsed" aria-label="AI Copilot collapsed">
        <div className="ac-collapsed-rail">
          <button type="button" className="ac-icon-btn" onClick={expand} title="Expand">
            ◂
          </button>
          <button type="button" onClick={expand}>
            AI Copilot
          </button>
        </div>
      </aside>
    );
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    ask(draft);
    setDraft("");
  };

  return (
    <aside
      className={`ac-panel${panelMode === "pinned" ? " is-pinned" : ""}`}
      aria-label="AI Copilot"
    >
      <header className="ac-header">
        <div className="ac-header-top">
          <h2 className="ac-title">AI Copilot</h2>
          <div className="ac-tabs">
            <button
              type="button"
              className={`ac-tab${tab === "assist" ? " is-active" : ""}`}
              onClick={() => setTab("assist")}
            >
              Assist
            </button>
            <button
              type="button"
              className={`ac-tab${tab === "history" ? " is-active" : ""}`}
              onClick={() => setTab("history")}
            >
              History
            </button>
            <button
              type="button"
              className={`ac-tab${tab === "prompts" ? " is-active" : ""}`}
              onClick={() => setTab("prompts")}
            >
              Prompts
            </button>
          </div>
          <button
            type="button"
            className={`ac-icon-btn${panelMode === "pinned" ? " is-active" : ""}`}
            title="Pin"
            onClick={() => (panelMode === "pinned" ? expand() : pin())}
          >
            Pin
          </button>
          <button type="button" className="ac-icon-btn" title="Collapse" onClick={collapse}>
            ▸
          </button>
          <button type="button" className="ac-icon-btn" title="Hide" onClick={hide}>
            ✕
          </button>
        </div>

        <div className="ac-context-line">
          Current Context ·{" "}
          <strong>{context.projectName || "No project"}</strong>
          {context.documentTitle ? (
            <>
              {" · "}
              <strong>{context.documentTitle}</strong>
            </>
          ) : null}
        </div>

        <div className="ac-badges" aria-label="Context badges">
          {context.projectName ? (
            <span className="ac-badge">Project · {context.projectName}</span>
          ) : null}
          {context.lessonTitle ? (
            <span className="ac-badge">Lesson · {context.lessonTitle}</span>
          ) : null}
          {context.documentKind === "worksheet" ? (
            <span className="ac-badge">Worksheet</span>
          ) : null}
          {context.documentKind === "assessment" ? (
            <span className="ac-badge">Assessment</span>
          ) : null}
          {context.subject ? (
            <span className="ac-badge">Subject · {context.subject}</span>
          ) : null}
          {context.grade ? (
            <span className="ac-badge">Grade · {context.grade}</span>
          ) : null}
          {context.competencies.slice(0, 2).map((c) => (
            <span key={c} className="ac-badge">
              Competency · {c}
            </span>
          ))}
        </div>
      </header>

      <div className="ac-working">
        <strong>Working with</strong>
        Project: {context.projectName || "—"}
        <br />
        Lesson: {context.lessonTitle || "—"}
        <br />
        Current selection: {context.selection ? context.selection.slice(0, 120) : "None"}
        <br />
        Activity: {context.activity}
      </div>

      <div className="ac-body">
        {tab === "assist" ? (
          <>
            <p className="ac-section-label">Quick actions</p>
            <div className="ac-actions">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="ac-chip"
                  disabled={busy}
                  onClick={() => runQuickAction(action.id)}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <p className="ac-section-label">Smart prompts</p>
            <div className="ac-prompts">
              {smartPrompts.slice(0, 5).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ac-prompt"
                  disabled={busy}
                  onClick={() => ask(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <p className="ac-section-label">Conversation</p>
            <div className="ac-chat">
              {messages.map((message) => {
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="ac-msg ac-msg-user">
                      {message.content}
                    </div>
                  );
                }
                if (message.role === "system") {
                  return (
                    <div key={message.id} className="ac-msg ac-msg-system">
                      <MarkdownContent source={message.content} />
                    </div>
                  );
                }
                return <ResponseCard key={message.id} content={message.content} />;
              })}
              {busy ? (
                <div className="ac-msg ac-msg-system">Thinking with your context…</div>
              ) : null}
              <div ref={endRef} />
            </div>
          </>
        ) : null}

        {tab === "history" ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p className="ac-section-label">History by project</p>
              <button type="button" className="ac-btn" onClick={newConversation}>
                New
              </button>
            </div>
            {historyGroups.length === 0 ? (
              <p className="ac-hint">No conversations yet.</p>
            ) : (
              historyGroups.map(([projectName, items]) => (
                <div key={projectName} className="ac-history-group">
                  <h4>{projectName}</h4>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="ac-history-item"
                      onClick={() => {
                        loadConversation(item.id);
                        setTab("assist");
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              ))
            )}
          </>
        ) : null}

        {tab === "prompts" ? (
          <>
            <p className="ac-section-label">Pinned</p>
            <div className="ac-actions">
              {pinnedPrompts.length === 0 ? (
                <span className="ac-hint">Pin favorites from recent prompts.</span>
              ) : (
                pinnedPrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="ac-chip is-pinned"
                    onClick={() => ask(p.text)}
                  >
                    {p.label.slice(0, 42)}
                  </button>
                ))
              )}
            </div>
            <p className="ac-section-label">Recent prompts</p>
            <div className="ac-prompts">
              {recentPrompts.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  style={{ display: "flex", gap: "0.35rem", alignItems: "stretch" }}
                >
                  <button
                    type="button"
                    className="ac-prompt"
                    style={{ flex: 1 }}
                    onClick={() => ask(p.text)}
                  >
                    {p.label}
                  </button>
                  <button
                    type="button"
                    className={`ac-btn${p.pinned ? " ac-btn-primary" : ""}`}
                    title={p.pinned ? "Unpin" : "Pin"}
                    onClick={() => togglePinPrompt(p.id)}
                  >
                    {p.pinned ? "★" : "☆"}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {tab === "assist" ? (
        <form className="ac-composer" onSubmit={onSubmit}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask with full project context…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (draft.trim()) {
                  ask(draft);
                  setDraft("");
                }
              }
            }}
          />
          <div className="ac-composer-row">
            <span className="ac-hint">Ctrl+K commands · Ctrl+J panel</span>
            <button type="submit" className="ac-btn ac-btn-primary" disabled={busy}>
              Ask
            </button>
          </div>
        </form>
      ) : null}
    </aside>
  );
}
