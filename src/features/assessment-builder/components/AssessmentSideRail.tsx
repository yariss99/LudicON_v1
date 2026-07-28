import { useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { AI_ACTIONS } from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import type { AssessmentBuilderPanel } from "../types";

export function AssessmentSideRail() {
  const {
    panel,
    setPanel,
    assessment,
    versions,
    lastPrompt,
    lastAiNote,
    runAi,
    restoreVersion,
    exportFormat,
  } = useAssessmentBuilder();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const tabs: { id: AssessmentBuilderPanel; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "validation", label: "Validare" },
    { id: "analytics", label: "Analitică" },
    { id: "versions", label: "Versiuni" },
    { id: "export", label: "Export" },
    { id: "bank", label: "Bancă" },
  ];

  return (
    <aside className="ab-rail" aria-label="Panouri Assessment Builder">
      <div className="ab-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["ab-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(panel === "editor" || panel === "ai") && (
        <div>
          <div className="ab-kicker" style={{ marginBottom: "0.55rem" }}>
            AI în context lecție + proiect
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="ab-btn"
                style={{ justifyContent: "flex-start" }}
                title={action.description}
                onClick={() => runAi(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
          {lastAiNote ? (
            <div className="ab-card" style={{ marginTop: "0.75rem" }}>
              {lastAiNote}
            </div>
          ) : null}
          {lastPrompt ? (
            <div style={{ marginTop: "0.85rem" }}>
              <div className="ab-kicker">Prompt Core</div>
              <pre className="ab-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      )}

      {panel === "validation" && (
        <div>
          {assessment.validation ? (
            <>
              <div className="ab-score">{assessment.validation.score}</div>
              <div className="ab-kicker" style={{ marginBottom: "0.75rem" }}>
                {assessment.validation.passed
                  ? "Trece Validation Engine"
                  : "Publicarea este blocată"}
              </div>
              {assessment.validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`ab-issue ab-issue-${issue.severity}`}
                >
                  <strong>{issue.message}</strong>
                  {issue.repairSuggestion ? (
                    <div className="ab-kicker" style={{ marginTop: "0.35rem" }}>
                      Reparație: {issue.repairSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <div className="ab-empty">Rulează validarea din antet.</div>
          )}
        </div>
      )}

      {panel === "analytics" && (
        <div>
          {assessment.analytics ? (
            <>
              <div className="ab-score">{assessment.analytics.qualityScore}</div>
              <div className="ab-kicker">Scor calitate</div>
              <div className="ab-card" style={{ marginTop: "0.75rem" }}>
                Succes estimat: {assessment.analytics.estimatedSuccessRate}%
              </div>
              <div className="ab-card">
                Timp: {assessment.analytics.estimatedMinutes} min
              </div>
              <div className="ab-card">
                Itemi: {assessment.analytics.totalQuestions}
              </div>
            </>
          ) : (
            <div className="ab-empty">Salvează pentru analitică.</div>
          )}
        </div>
      )}

      {panel === "versions" && (
        <div>
          {versions.slice(0, 25).map((v) => (
            <div key={v.id} className="ab-card">
              <div className="ab-card-head">
                <strong>v{v.version}</strong>
                <span className="ab-chip">{v.actor}</span>
              </div>
              <div className="ab-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
              <div className="ab-actions" style={{ marginTop: "0.45rem" }}>
                <button
                  type="button"
                  className="ab-btn"
                  onClick={() => setCompareA(v.id)}
                >
                  A
                </button>
                <button
                  type="button"
                  className="ab-btn"
                  onClick={() => setCompareB(v.id)}
                >
                  B
                </button>
                <button
                  type="button"
                  className="ab-btn ab-btn-primary"
                  onClick={() => restoreVersion(v.id)}
                >
                  Restaurează
                </button>
              </div>
            </div>
          ))}
          {(compareA || compareB) && (
            <pre className="ab-pre">
              {JSON.stringify(
                {
                  a: versions.find((v) => v.id === compareA)?.version,
                  b: versions.find((v) => v.id === compareB)?.version,
                  aTitle: versions.find((v) => v.id === compareA)?.snapshot
                    .title,
                  bTitle: versions.find((v) => v.id === compareB)?.snapshot
                    .title,
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}

      {panel === "export" && (
        <div className="ab-actions" style={{ flexDirection: "column" }}>
          {(["pdf", "docx", "html", "printable", "lms"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="ab-btn ab-btn-primary"
              onClick={() => exportFormat(f)}
            >
              Export {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {panel === "bank" && (
        <div>
          <div className="ab-kicker" style={{ marginBottom: "0.55rem" }}>
            {assessment.bank.length} itemi în bancă
          </div>
          {assessment.bank.length === 0 ? (
            <div className="ab-empty">Generează o bancă cu AI.</div>
          ) : (
            assessment.bank.map((q) => (
              <div key={q.id} className="ab-card">
                <div className="ab-kicker">{q.type}</div>
                <div>{q.prompt || "(gol)"}</div>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
