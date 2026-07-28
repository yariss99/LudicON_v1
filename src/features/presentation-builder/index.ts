export {
  PresentationBuilderPage,
  PresentationBuilderEntryPage,
} from "./PresentationBuilderPage";
export {
  PresentationBuilderProvider,
  usePresentationBuilder,
  createPresentationInProject,
} from "./hooks/usePresentationBuilder";
export { presentationBuilderRepository } from "./services/presentationBuilderRepository";
export { validatePresentation } from "./services/presentationValidation";
export {
  exportPresentation,
  downloadExport,
} from "./services/presentationExport";
export {
  applyPresentationAiAction,
  buildPresentationPromptPackage,
  syncPresentationToWorkspace,
  ensureLessonForProject,
  seedPresentationFromBestSource,
} from "./services/presentationCoreBridge";
export type * from "./types";
