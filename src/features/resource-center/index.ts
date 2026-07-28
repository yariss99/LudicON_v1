export {
  ResourceCenterPage,
  ResourceCenterMissing,
} from "./ResourceCenterPage";
export {
  ResourceCenterProvider,
  useResourceCenter,
} from "./hooks/useResourceCenter";
export { resourceCenterRepository } from "./services/resourceCenterRepository";
export {
  reindexKnowledgeBase,
  seedDemoMediaIfEmpty,
} from "./services/resourceIndexer";
export {
  searchResources,
  findSimilar,
  detectDuplicates,
  emptyFilters,
} from "./services/resourceSearch";
export { buildKnowledgeGraph } from "./services/resourceGraph";
export {
  applyResourceAiAction,
  buildResourcePromptPackage,
} from "./services/resourceAiBridge";
export { computeResourceAnalytics } from "./services/resourceAnalytics";
export type * from "./types";
