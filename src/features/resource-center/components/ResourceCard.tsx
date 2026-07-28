import { ASSET_TYPE_LABEL } from "../constants";
import type { KnowledgeResource } from "../types";

type Props = {
  resource: KnowledgeResource;
  active?: boolean;
  score?: number;
  reasons?: readonly string[];
  onSelect: () => void;
};

export function ResourceCard({
  resource,
  active,
  score,
  reasons,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      className={["rc-resource-card", active ? "is-active" : ""].join(" ")}
      onClick={onSelect}
    >
      <div className="rc-meta">
        <span className="rc-chip">
          {ASSET_TYPE_LABEL[resource.assetType] ?? resource.assetType}
        </span>
        {resource.favorite ? <span className="rc-chip">★</span> : null}
        {score != null ? (
          <span className="rc-chip">{Math.round(score * 100)}%</span>
        ) : null}
      </div>
      <h3>{resource.name}</h3>
      <p>{resource.description || resource.ai.summary || "Fără descriere"}</p>
      <div className="rc-meta">
        <span className="rc-chip">{resource.subject || "—"}</span>
        <span className="rc-chip">{resource.grade || "—"}</span>
        <span className="rc-chip">v{resource.version}</span>
        {resource.estimatedMinutes ? (
          <span className="rc-chip">~{resource.estimatedMinutes} min</span>
        ) : null}
      </div>
      {reasons?.length ? (
        <div className="rc-kicker">{reasons.join(" · ")}</div>
      ) : null}
    </button>
  );
}
