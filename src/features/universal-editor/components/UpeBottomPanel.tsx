import { Link } from "react-router-dom";
import { DEFAULT_PUBLICATION_PROFILES } from "../../../engines/pde";
import { BOTTOM_TABS } from "../constants";
import type {
  UpeBottomTab,
  UpePreviewMode,
  UpeValidationIssue,
  UpeVersionSnapshot,
} from "../types";

type UpeBottomPanelProps = {
  tab: UpeBottomTab;
  onTab: (tab: UpeBottomTab) => void;
  issues: UpeValidationIssue[];
  versions: UpeVersionSnapshot[];
  previewMode: UpePreviewMode;
  onRestore: (versionId: string) => void;
  onJumpToBlock: (blockId: string) => void;
  publishProfileId: string;
  onPublishProfile: (profileId: string) => void;
  previewCompleted: boolean;
  onMarkPreviewed: () => void;
  publishMessage: string | null;
  onPublish: () => void;
};

function UpeBottomPanel({
  tab,
  onTab,
  issues,
  versions,
  previewMode,
  onRestore,
  onJumpToBlock,
  publishProfileId,
  onPublishProfile,
  previewCompleted,
  onMarkPreviewed,
  publishMessage,
  onPublish,
}: UpeBottomPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1 border-b border-[var(--prima-border)] px-3 py-2">
        {BOTTOM_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={[
              "rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold",
              tab === item.id
                ? "bg-[var(--prima-primary)] text-white"
                : "text-[var(--prima-text-muted)] hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
            {item.id === "validation" && issues.length > 0
              ? ` (${issues.length})`
              : ""}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tab === "validation" && (
          <ul className="space-y-2">
            {issues.length === 0 ? (
              <li className="text-sm text-[var(--prima-text-muted)]">
                Totul arată bine momentan.
              </li>
            ) : (
              issues.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-[var(--radius-md)] border border-[var(--prima-border)] bg-white px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "text-[11px] font-bold uppercase",
                        issue.severity === "error"
                          ? "text-[var(--prima-danger)]"
                          : issue.severity === "warning"
                            ? "text-[var(--prima-accent)]"
                            : "text-[var(--prima-text-muted)]",
                      ].join(" ")}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-sm font-semibold">{issue.title}</span>
                    <span className="text-[11px] text-[var(--prima-text-muted)]">
                      {issue.source.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
                    {issue.explanation}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Sugestie:</span>{" "}
                    {issue.suggestedFix}
                  </p>
                  <p className="text-xs text-[var(--prima-text-muted)]">
                    Impact: {issue.estimatedImpact}
                  </p>
                  {issue.blockId ? (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-[var(--prima-primary)]"
                      onClick={() => onJumpToBlock(issue.blockId!)}
                    >
                      Mergi la bloc
                    </button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        )}

        {tab === "history" && (
          <ul className="space-y-2">
            {versions.map((version) => (
              <li
                key={version.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--prima-border)] bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold">{version.summary}</p>
                  <p className="text-xs text-[var(--prima-text-muted)]">
                    {new Date(version.createdAt).toLocaleString("ro-RO")} ·{" "}
                    {version.kind}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(version.id)}
                  className="text-xs font-semibold text-[var(--prima-primary)]"
                >
                  Restaurează
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "export" && (
          <div className="space-y-3 text-sm text-[var(--prima-text-muted)]">
            <p>
              Publicarea livrează experiența de învățare din obiectul pedagogic
              — nu din fișiere separate. Previzualizare curentă:{" "}
              <strong className="text-[var(--prima-text)]">{previewMode}</strong>
              .
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Profil de publicare
                <select
                  value={publishProfileId}
                  onChange={(e) => onPublishProfile(e.target.value)}
                  className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--prima-text)]"
                >
                  {DEFAULT_PUBLICATION_PROFILES.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nameRo}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={onMarkPreviewed}
                className="rounded-[var(--radius-full)] px-3 py-2 text-xs font-semibold text-[var(--prima-primary)] hover:bg-blue-50"
              >
                {previewCompleted
                  ? "✓ Previzualizare confirmată"
                  : "Confirmă previzualizarea"}
              </button>
              <button
                type="button"
                onClick={onPublish}
                className="rounded-[var(--radius-full)] bg-[var(--prima-primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Publică
              </button>
              <Link
                to="/publishing"
                className="rounded-[var(--radius-full)] px-3 py-2 text-xs font-semibold text-[var(--prima-text-muted)] hover:bg-slate-100"
              >
                Istoric publicații
              </Link>
            </div>
            {publishMessage ? (
              <p className="text-sm text-[var(--prima-text)]">{publishMessage}</p>
            ) : null}
          </div>
        )}

        {tab === "compare" && (
          <p className="text-sm text-[var(--prima-text-muted)]">
            Compararea versiunilor va afișa diferențele pe blocuri.
          </p>
        )}

        {tab === "comments" && (
          <p className="text-sm text-[var(--prima-text-muted)]">
            Comentariile și revizia mentorului vin într-un sprint viitor.
          </p>
        )}
      </div>
    </div>
  );
}

export default UpeBottomPanel;
