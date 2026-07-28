import { useState } from "react";
import { AI_ACTIONS } from "../constants";
import { useLessonBuilder } from "../hooks/useLessonBuilder";
import { formatRelativeTime } from "../../../utils/date";
import type { LessonBuilderPanel } from "../types";

export function LessonSideRail() {
  const {
    panel,
    setPanel,
    lesson,
    versions,
    lastPrompt,
    runAi,
    restoreVersion,
    addComment,
  } = useLessonBuilder();
  const [comment, setComment] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const tabs: { id: LessonBuilderPanel; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "validation", label: "Validare" },
    { id: "versions", label: "Versiuni" },
    { id: "comments", label: "Comentarii" },
  ];

  return (
    <aside className="lb-rail" aria-label="Panouri Lesson Builder">
      <div className="lb-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["lb-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {panel === "editor" || panel === "ai" ? (
        <div>
          <div className="lb-kicker" style={{ marginBottom: "0.55rem" }}>
            AI în contextul proiectului
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="lb-btn"
                style={{ justifyContent: "flex-start" }}
                onClick={() => runAi(action.id)}
                title={action.description}
              >
                {action.label}
              </button>
            ))}
          </div>
          {lastPrompt ? (
            <div style={{ marginTop: "1rem" }}>
              <div className="lb-kicker">Ultimul prompt (Core)</div>
              <pre className="lb-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      ) : null}

      {panel === "validation" ? (
        <div>
          {lesson.validation ? (
            <>
              <div className="lb-score">{lesson.validation.score}</div>
              <div className="lb-kicker" style={{ marginBottom: "0.75rem" }}>
                {lesson.validation.passed
                  ? "Trece Validation Engine"
                  : "Nu trece încă — publicarea e blocată"}
              </div>
              {lesson.validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`lb-issue lb-issue-${issue.severity}`}
                >
                  <strong>{issue.message}</strong>
                  {issue.repairSuggestion ? (
                    <div className="lb-kicker" style={{ marginTop: "0.35rem" }}>
                      Reparație: {issue.repairSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <div className="lb-empty">Rulează validarea din antet.</div>
          )}
        </div>
      ) : null}

      {panel === "versions" ? (
        <div>
          <div className="lb-kicker" style={{ marginBottom: "0.55rem" }}>
            Fiecare salvare creează o versiune
          </div>
          {versions.slice(0, 30).map((v) => (
            <div key={v.id} className="lb-card">
              <div className="lb-card-head">
                <strong>v{v.version}</strong>
                <span className="lb-chip">{v.actor}</span>
              </div>
              <div className="lb-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
              <div className="lb-actions" style={{ marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="lb-btn"
                  onClick={() => setCompareA(v.id)}
                >
                  A
                </button>
                <button
                  type="button"
                  className="lb-btn"
                  onClick={() => setCompareB(v.id)}
                >
                  B
                </button>
                <button
                  type="button"
                  className="lb-btn lb-btn-primary"
                  onClick={() => restoreVersion(v.id)}
                >
                  Restaurează
                </button>
              </div>
            </div>
          ))}
          {(compareA || compareB) && (
            <pre className="lb-pre">
              {JSON.stringify(
                {
                  a: versions.find((v) => v.id === compareA)?.version,
                  b: versions.find((v) => v.id === compareB)?.version,
                  aTitle: versions.find((v) => v.id === compareA)?.snapshot
                    .general.title,
                  bTitle: versions.find((v) => v.id === compareB)?.snapshot
                    .general.title,
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      ) : null}

      {panel === "comments" ? (
        <div>
          <label className="lb-field">
            Comentariu pe secțiunea activă
            <textarea
              className="lb-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="lb-btn lb-btn-primary"
            onClick={() => {
              if (!comment.trim()) return;
              addComment(comment);
              setComment("");
            }}
          >
            Adaugă
          </button>
          <div style={{ marginTop: "0.85rem" }}>
            {lesson.comments.map((c) => (
              <div key={c.id} className="lb-card">
                <div className="lb-kicker">
                  {c.sectionId} · {c.author} · {formatRelativeTime(c.createdAt)}
                </div>
                <div>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
