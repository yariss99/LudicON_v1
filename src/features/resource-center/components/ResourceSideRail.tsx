import { formatRelativeTime } from "../../../utils/date";
import { AI_ACTIONS } from "../constants";
import { useResourceCenter } from "../hooks/useResourceCenter";
import type { ResourceCenterPanel } from "../types";
import { ResourceCard } from "./ResourceCard";

export function ResourceSideRail() {
  const {
    panel,
    setPanel,
    selected,
    versions,
    lastPrompt,
    lastAiMessage,
    aiSuggestions,
    selectResource,
    runAi,
    analytics,
  } = useResourceCenter();

  const tabs: { id: ResourceCenterPanel; label: string }[] = [
    { id: "browse", label: "Browse" },
    { id: "search", label: "Search" },
    { id: "graph", label: "Graph" },
    { id: "detail", label: "Detail" },
    { id: "ai", label: "AI" },
    { id: "analytics", label: "Stats" },
    { id: "sharing", label: "Share" },
    { id: "versions", label: "Vers" },
  ];

  return (
    <aside className="rc-rail" aria-label="Panouri Resource Center">
      <div className="rc-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={["rc-tab", panel === t.id ? "is-active" : ""].join(" ")}
            onClick={() => setPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(panel === "browse" || panel === "search" || panel === "detail") && (
        <div>
          {selected ? (
            <div className="rc-card">
              <strong>{selected.name}</strong>
              <div className="rc-kicker">
                {selected.assetType} · {selected.subject} · {selected.grade}
              </div>
              <div className="rc-kicker">
                opens {selected.usage.openCount} · reuse{" "}
                {selected.usage.reuseCount}
                {selected.usage.lastUsedAt
                  ? ` · ${formatRelativeTime(selected.usage.lastUsedAt)}`
                  : ""}
              </div>
              <div className="rc-meta" style={{ marginTop: "0.45rem" }}>
                {selected.tags.slice(0, 6).map((t) => (
                  <span key={t} className="rc-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rc-empty">Nicio selecție</div>
          )}
        </div>
      )}

      {panel === "ai" && (
        <div>
          <div className="rc-kicker" style={{ marginBottom: "0.55rem" }}>
            PRIMA Core · Knowledge
          </div>
          {lastAiMessage ? (
            <div className="rc-card">{lastAiMessage}</div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="rc-btn"
                style={{ justifyContent: "flex-start" }}
                title={action.description}
                onClick={() => runAi(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
          {aiSuggestions.length > 0 ? (
            <div style={{ marginTop: "0.85rem" }}>
              {aiSuggestions.slice(0, 5).map((hit) => (
                <div key={hit.resource.id} style={{ marginBottom: "0.5rem" }}>
                  <ResourceCard
                    resource={hit.resource}
                    score={hit.score}
                    reasons={hit.reasons}
                    onSelect={() => selectResource(hit.resource.id)}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {lastPrompt ? (
            <div style={{ marginTop: "0.85rem" }}>
              <div className="rc-kicker">Prompt Core</div>
              <pre className="rc-pre">{lastPrompt.user}</pre>
            </div>
          ) : null}
        </div>
      )}

      {panel === "analytics" && (
        <div>
          <div className="rc-card">
            <div className="rc-kicker">Reuse total</div>
            <div className="rc-stat">{analytics.reuseStats.totalReuses}</div>
          </div>
          <div className="rc-card">
            <div className="rc-kicker">Unused</div>
            <div className="rc-stat">{analytics.unused.length}</div>
          </div>
          {analytics.mostUsed.slice(0, 4).map((r) => (
            <div key={r.id} className="rc-card">
              <strong>{r.name}</strong>
              <div className="rc-kicker">
                {r.usage.openCount} opens · {r.usage.reuseCount} reuse
              </div>
            </div>
          ))}
        </div>
      )}

      {panel === "versions" && (
        <div>
          {versions.slice(0, 12).map((v) => (
            <div key={v.id} className="rc-card">
              <strong>v{v.version}</strong>
              <div className="rc-kicker">
                {v.note} · {formatRelativeTime(v.createdAt)}
              </div>
            </div>
          ))}
          {!versions.length ? (
            <div className="rc-empty">Fără istoric pe selecție.</div>
          ) : null}
        </div>
      )}

      {panel === "sharing" && selected && (
        <div className="rc-card">
          <strong>Partajare</strong>
          <div className="rc-kicker">
            {selected.shareScope} · {selected.sharePermission}
          </div>
        </div>
      )}

      {panel === "graph" && (
        <div className="rc-card">
          <strong>Graph</strong>
          <div className="rc-kicker">
            Deschis în panoul principal — click pe noduri tip resursă.
          </div>
        </div>
      )}
    </aside>
  );
}
