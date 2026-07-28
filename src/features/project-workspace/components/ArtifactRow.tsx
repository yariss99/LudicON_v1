import { ARTIFACT_KIND_LABEL } from "../constants";
import type { ArtifactStatus, ProjectArtifact } from "../types";
import { formatRelativeTime } from "../../../utils/date";

const STATUS_LABEL: Record<ArtifactStatus, string> = {
  draft: "Ciornă",
  ready: "Gata",
  archived: "Arhivat",
};

type Props = {
  artifact: ProjectArtifact;
  selected?: boolean;
  onSelect?: () => void;
  actions?: React.ReactNode;
};

export function ArtifactRow({
  artifact,
  selected,
  onSelect,
  actions,
}: Props) {
  return (
    <div
      className={["pw-row", selected ? "is-selected" : ""].join(" ")}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="pw-row-main">
        <div className="pw-row-title">{artifact.title}</div>
        <div className="pw-row-meta">
          {ARTIFACT_KIND_LABEL[artifact.kind] ?? artifact.kind}
          {" · "}
          v{artifact.version}
          {" · "}
          {formatRelativeTime(artifact.updatedAt)}
          {" · "}
          <span className={`pw-status pw-status-${artifact.status}`}>
            {STATUS_LABEL[artifact.status]}
          </span>
        </div>
      </div>
      {actions ? (
        <div
          className="pw-row-actions"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
