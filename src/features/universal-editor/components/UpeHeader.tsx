import { Link } from "react-router-dom";
import { PrimaMark, StatusBadge } from "../../../design-system";
import type { UpeAutosaveStatus, UpePreviewMode } from "../types";
import { PREVIEW_MODES } from "../constants";

type UpeHeaderProps = {
  lessonTitle?: string;
  lessonProjectId: string | null;
  title: string;
  versionLabel: string;
  autosave: UpeAutosaveStatus;
  pieScore: number;
  previewMode: UpePreviewMode;
  onPreviewMode: (mode: UpePreviewMode) => void;
  onUndo: () => void;
  bottomOpen: boolean;
  onToggleBottom: () => void;
};

function UpeHeader({
  lessonTitle,
  lessonProjectId,
  title,
  versionLabel,
  autosave,
  pieScore,
  previewMode,
  onPreviewMode,
  onUndo,
  bottomOpen,
  onToggleBottom,
}: UpeHeaderProps) {
  const saveLabel =
    autosave === "saving"
      ? "Se salvează..."
      : autosave === "error"
        ? "Salvare întreruptă"
        : "✓ Salvat automat";

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
      <PrimaMark size={22} pulse={autosave === "saving"} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-[var(--prima-text-muted)]">
          {lessonProjectId ? (
            <Link
              to={`/blueprint/review/${lessonProjectId}`}
              className="hover:text-[var(--prima-primary)]"
            >
              {lessonTitle ?? "Proiectul lecției"}
            </Link>
          ) : (
            <span>Material independent</span>
          )}
          <span className="mx-1.5">·</span>
          <span>{title}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <StatusBadge tone={autosave === "saving" ? "syncing" : "saved"}>
            {saveLabel}
          </StatusBadge>
          <span className="text-xs text-[var(--prima-text-muted)]">
            {versionLabel}
          </span>
          <StatusBadge tone={pieScore >= 80 ? "saved" : "attention"}>
            {`PIE ${pieScore}%`}
          </StatusBadge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="upe-preview-mode">
          Mod previzualizare
        </label>
        <select
          id="upe-preview-mode"
          value={previewMode}
          onChange={(e) => onPreviewMode(e.target.value as UpePreviewMode)}
          className="rounded-[var(--radius-full)] border border-[var(--prima-border)] bg-white px-3 py-1.5 text-xs font-medium"
        >
          {PREVIEW_MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              Previzualizare: {mode.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold text-[var(--prima-text-muted)] hover:bg-slate-100"
        >
          Anulează
        </button>
        <button
          type="button"
          onClick={onToggleBottom}
          className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold text-[var(--prima-primary)] hover:bg-blue-50"
        >
          {bottomOpen ? "Ascunde panoul" : "Arată panoul"}
        </button>
      </div>
    </div>
  );
}

export default UpeHeader;
