import { useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { AI_ACTIONS } from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";
import { StoryPreview } from "./StoryPreview";
import type { StoryBuilderPanel } from "../types";

export function StorySideRail() {
  const {
    panel,
    setPanel,
    story,
    versions,
    lastPrompt,
    runAi,
    restoreVersion,
    exportFormat,
  } = useStoryBuilder();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const tabs: { id: StoryBuilderPanel; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "preview", label: "Preview" },
    { id: "validation", label: "Validare" },
    { id: "versions", label: "Versiuni" },
    { id: "export", label: "Export" },
  ];

  return (
    <aside className="sb-rail" aria-label="Panouri Story Builder">
      <div className="sb-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["sb-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(panel === "editor" || panel === "ai") && (
        <div>
          <div className="sb-kicker" style={{ marginBottom: "0.55rem" }}>
            AI în context lecție + proiect
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="sb-btn"
                style={{ justifyContent: "flex-start" }}
                title={action.description}
                onClick={() => runAi(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
          {lastPrompt ? (
            <div style={{ marginTop: "0.85rem" }}>
              <div className="sb-kicker">Prompt Core</div>
              <pre className="sb-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      )}

      {panel === "preview" && <StoryPreview />}

      {panel === "branching" && (
        <div className="sb-kicker">
          Folosește secțiunea Ramificații din editor pentru legături complete.
        </div>
      )}

      {panel === "validation" && (
        <div>
          {story.validation ? (
            <>
              <div className="sb-score">{story.validation.score}</div>
              <div className="sb-kicker" style={{ marginBottom: "0.75rem" }}>
                {story.validation.passed
                  ? "Trece Validation Engine"
                  : "Publicarea este blocată"}
              </div>
              {story.validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`sb-issue sb-issue-${issue.severity}`}
                >
                  <strong>{issue.message}</strong>
                  {issue.repairSuggestion ? (
                    <div className="sb-kicker" style={{ marginTop: "0.35rem" }}>
                      Reparație: {issue.repairSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <div className="sb-empty">Rulează validarea din antet.</div>
          )}
        </div>
      )}

      {panel === "versions" && (
        <div>
          {versions.slice(0, 25).map((v) => (
            <div key={v.id} className="sb-card">
              <div className="sb-card-head">
                <strong>v{v.version}</strong>
                <span className="sb-chip">{v.actor}</span>
              </div>
              <div className="sb-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
              <div className="sb-actions" style={{ marginTop: "0.45rem" }}>
                <button
                  type="button"
                  className="sb-btn"
                  onClick={() => setCompareA(v.id)}
                >
                  A
                </button>
                <button
                  type="button"
                  className="sb-btn"
                  onClick={() => setCompareB(v.id)}
                >
                  B
                </button>
                <button
                  type="button"
                  className="sb-btn sb-btn-primary"
                  onClick={() => restoreVersion(v.id)}
                >
                  Restaurează
                </button>
              </div>
            </div>
          ))}
          {(compareA || compareB) && (
            <pre className="sb-pre">
              {JSON.stringify(
                {
                  a: versions.find((v) => v.id === compareA)?.version,
                  b: versions.find((v) => v.id === compareB)?.version,
                  aTitle: versions.find((v) => v.id === compareA)?.snapshot.title,
                  bTitle: versions.find((v) => v.id === compareB)?.snapshot.title,
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}

      {panel === "export" && (
        <div className="sb-actions" style={{ flexDirection: "column" }}>
          {(
            ["html", "pdf", "presentation", "print", "teacher", "student"] as const
          ).map((f) => (
            <button
              key={f}
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => exportFormat(f)}
            >
              Export {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
