export type {
  AutosaveState,
  CommitOptions,
  DraftRecord,
  EditorResourceType,
  HistoryAction,
  SaveStatus,
  VersionEntry,
} from "./types";
export { HISTORY_ACTION_LABEL } from "./types";
export {
  AUTOSAVE_DEBOUNCE_MS,
  DRAFT_STORAGE_PREFIX,
  VERSION_STORAGE_KEY,
} from "./constants";
export { AutosaveManager } from "./services/AutosaveManager";
export { DraftManager } from "./services/DraftManager";
export { HistoryManager } from "./services/HistoryManager";
export {
  useEditorPersistence,
  inferHistoryAction,
  type DraftOffer,
  type EditorPersistenceApi,
  type UseEditorPersistenceOptions,
} from "./hooks/useEditorPersistence";
export { SaveStatusBadge } from "./components/SaveStatusBadge";
export { RestoreDraftDialog } from "./components/RestoreDraftDialog";
export { VersionHistoryPanel } from "./components/VersionHistoryPanel";
export { StudioPersistenceControls } from "./components/StudioPersistenceControls";
export { formatSaveStatus } from "./utils/formatSaveStatus";
