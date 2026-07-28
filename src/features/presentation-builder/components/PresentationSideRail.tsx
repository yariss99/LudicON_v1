import { useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { AI_ACTIONS } from "../constants";
import { usePresentationBuilder } from "../hooks/usePresentationBuilder";
import type { PresentationBuilderPanel } from "../types";
import { SlideCanvas } from "./SlideCanvas";

export function PresentationSideRail() {
  const {
    panel,
    setPanel,
    presentation,
    versions,
    lastPrompt,
    selectedSlideId,
    runAi,
    restoreVersion,
    exportFormat,
  } = usePresentationBuilder();
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const tabs: { id: PresentationBuilderPanel; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "outline", label: "Outline" },
    { id: "theme", label: "Temă" },
    { id: "preview", label: "Preview" },
    { id: "presenter", label: "Presenter" },
    { id: "validation", label: "Validare" },
    { id: "versions", label: "Versiuni" },
    { id: "export", label: "Export" },
  ];

  const slides = [...presentation.slides].sort((a, b) => a.order - b.order);
  const selected =
    slides.find((s) => s.id === selectedSlideId) ?? slides[0] ?? null;

  return (
    <aside className="pb-rail" aria-label="Panouri Presentation Builder">
      <div className="pb-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["pb-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(panel === "editor" || panel === "ai") && (
        <div>
          <div className="pb-kicker" style={{ marginBottom: "0.55rem" }}>
            AI din conținut PRIMA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="pb-btn"
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
              <div className="pb-kicker">Prompt Core</div>
              <pre className="pb-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      )}

      {panel === "outline" && (
        <div>
          {slides.map((s, i) => (
            <div key={s.id} className="pb-card">
              <strong>
                {i + 1}. {s.title}
              </strong>
              <div className="pb-kicker">
                {s.type} · {s.estimatedSeconds}s
              </div>
            </div>
          ))}
        </div>
      )}

      {panel === "theme" && (
        <div className="pb-card">
          <strong>Temă activă</strong>
          <div className="pb-kicker">{presentation.themeId}</div>
          {selected ? (
            <div style={{ marginTop: "0.75rem" }}>
              <SlideCanvas
                slide={selected}
                themeId={presentation.themeId}
                compact
              />
            </div>
          ) : null}
        </div>
      )}

      {panel === "preview" && (
        <div>
          {selected ? (
            <SlideCanvas
              slide={selected}
              themeId={presentation.themeId}
              compact
            />
          ) : (
            <div className="pb-empty">Selectează un slide.</div>
          )}
          <div className="pb-kicker" style={{ marginTop: "0.65rem" }}>
            {slides.length} slide-uri · ~{presentation.estimatedMinutes} min
          </div>
        </div>
      )}

      {panel === "presenter" && (
        <div className="pb-card">
          <strong>Presenter Mode activ</strong>
          <p className="pb-kicker">
            Overlay pe ecran întreg. Esc pentru ieșire.
          </p>
        </div>
      )}

      {panel === "validation" && (
        <div>
          {presentation.validation ? (
            <>
              <div className="pb-score">{presentation.validation.score}</div>
              <div className="pb-kicker" style={{ marginBottom: "0.75rem" }}>
                {presentation.validation.passed
                  ? "Trece Validation Engine"
                  : "Publicarea este blocată"}
              </div>
              {presentation.validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`pb-issue pb-issue-${issue.severity}`}
                >
                  <strong>{issue.message}</strong>
                  {issue.repairSuggestion ? (
                    <div className="pb-kicker" style={{ marginTop: "0.35rem" }}>
                      Reparație: {issue.repairSuggestion}
                    </div>
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <div className="pb-empty">Rulează validarea din antet.</div>
          )}
        </div>
      )}

      {panel === "versions" && (
        <div>
          {versions.slice(0, 25).map((v) => (
            <div key={v.id} className="pb-card">
              <div className="pb-card-head">
                <strong>v{v.version}</strong>
                <span className="pb-chip">{v.actor}</span>
              </div>
              <div className="pb-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
              <div className="pb-actions" style={{ marginTop: "0.45rem" }}>
                <button
                  type="button"
                  className="pb-btn"
                  onClick={() => setCompareA(v.id)}
                >
                  A
                </button>
                <button
                  type="button"
                  className="pb-btn"
                  onClick={() => setCompareB(v.id)}
                >
                  B
                </button>
                <button
                  type="button"
                  className="pb-btn pb-btn-primary"
                  onClick={() => restoreVersion(v.id)}
                >
                  Restaurează
                </button>
              </div>
            </div>
          ))}
          {(compareA || compareB) && (
            <pre className="pb-pre">
              {JSON.stringify(
                {
                  a: versions.find((v) => v.id === compareA)?.version,
                  b: versions.find((v) => v.id === compareB)?.version,
                  aTitle: versions.find((v) => v.id === compareA)?.snapshot
                    .title,
                  bTitle: versions.find((v) => v.id === compareB)?.snapshot
                    .title,
                  aSlides: versions.find((v) => v.id === compareA)?.snapshot
                    .slides.length,
                  bSlides: versions.find((v) => v.id === compareB)?.snapshot
                    .slides.length,
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}

      {panel === "export" && (
        <div className="pb-actions" style={{ flexDirection: "column" }}>
          {(
            ["pptx", "pdf", "html", "presenter", "student", "print"] as const
          ).map((f) => (
            <button
              key={f}
              type="button"
              className="pb-btn pb-btn-primary"
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
