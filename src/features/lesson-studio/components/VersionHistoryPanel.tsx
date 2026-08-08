/**
 * @deprecated Prefer `VersionHistoryPanel` / `StudioPersistenceControls`
 * from `modules/editor-persistence`. Kept as a thin adapter for any legacy imports.
 */
import {
  VersionHistoryPanel as SharedVersionHistoryPanel,
  type VersionEntry,
} from "../../../modules/editor-persistence";
import type { LessonStudioDocument } from "../types";
import { useLessonStudio } from "../hooks/useLessonStudio";

type VersionHistoryPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function VersionHistoryPanel({
  open,
  onClose,
}: VersionHistoryPanelProps) {
  const { versions, restoreVersion } = useLessonStudio();

  return (
    <SharedVersionHistoryPanel<LessonStudioDocument>
      open={open}
      onClose={onClose}
      versions={versions as VersionEntry<LessonStudioDocument>[]}
      onRestore={restoreVersion}
    />
  );
}
