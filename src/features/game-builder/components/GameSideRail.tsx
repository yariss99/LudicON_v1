import { useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { AI_ACTIONS } from "../constants";
import { useGameBuilder } from "../hooks/useGameBuilder";
import { GameSimulation } from "./GameSimulation";
import type { GameBuilderPanel } from "../types";

export function GameSideRail() {
  const {
    panel,
    setPanel,
    game,
    versions,
    lastPrompt,
    runAi,
    restoreVersion,
    exportFormat,
  } = useGameBuilder();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const tabs: { id: GameBuilderPanel; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "mechanics", label: "Mecanici" },
    { id: "preview", label: "Preview" },
    { id: "simulate", label: "Simulare" },
    { id: "validation", label: "Validare" },
    { id: "versions", label: "Versiuni" },
    { id: "export", label: "Export" },
  ];

  return (
    <aside className="gb-rail" aria-label="Panouri Game Builder">
      <div className="gb-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["gb-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(panel === "editor" || panel === "ai") && (
        <div>
          <div className="gb-kicker" style={{ marginBottom: "0.55rem" }}>
            AI din resurse PRIMA (nu canvas gol)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="gb-btn"
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
              <div className="gb-kicker">Prompt Core</div>
              <pre className="gb-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      )}

      {panel === "mechanics" && (
        <div>
          {game.mechanics
            .filter((m) => m.enabled)
            .map((m) => (
              <div key={m.id} className="gb-card">
                <strong>{m.id}</strong>
                <div className="gb-kicker">valoare {m.value}</div>
              </div>
            ))}
        </div>
      )}

      {panel === "preview" && (
        <div className="gb-card">
          <strong>{game.title}</strong>
          <div className="gb-kicker">
            {game.levels.length} nivele · {game.questions.length} Q
          </div>
          <div className="gb-kicker">Sursă: {game.source.label}</div>
        </div>
      )}

      {panel === "simulate" && <GameSimulation />}

      {panel === "validation" && (
        <div>
          {game.validation ? (
            <>
              <div className="gb-score">{game.validation.score}</div>
              <div className="gb-kicker" style={{ marginBottom: "0.75rem" }}>
                {game.validation.passed
                  ? "Trece Validation Engine"
                  : "Publicarea este blocată"}
              </div>
              {game.validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`gb-issue gb-issue-${issue.severity}`}
                >
                  <strong>{issue.message}</strong>
                  {issue.repairSuggestion ? (
                    <div className="gb-kicker" style={{ marginTop: "0.35rem" }}>
                      Reparație: {issue.repairSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <div className="gb-empty">Rulează validarea din antet.</div>
          )}
        </div>
      )}

      {panel === "versions" && (
        <div>
          {versions.slice(0, 25).map((v) => (
            <div key={v.id} className="gb-card">
              <div className="gb-card-head">
                <strong>v{v.version}</strong>
                <span className="gb-chip">{v.actor}</span>
              </div>
              <div className="gb-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
              <div className="gb-actions" style={{ marginTop: "0.45rem" }}>
                <button
                  type="button"
                  className="gb-btn"
                  onClick={() => setCompareA(v.id)}
                >
                  A
                </button>
                <button
                  type="button"
                  className="gb-btn"
                  onClick={() => setCompareB(v.id)}
                >
                  B
                </button>
                <button
                  type="button"
                  className="gb-btn gb-btn-primary"
                  onClick={() => restoreVersion(v.id)}
                >
                  Restaurează
                </button>
              </div>
            </div>
          ))}
          {(compareA || compareB) && (
            <pre className="gb-pre">
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
        <div className="gb-actions" style={{ flexDirection: "column" }}>
          {(["html", "web", "classroom", "print", "qr"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="gb-btn gb-btn-primary"
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
