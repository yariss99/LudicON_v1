import { assetRegistry } from "./assetRegistry";
import type {
  AssetTypeId,
  GeneratedAsset,
  GenerationWorkspaceDocument,
} from "../types";

/**
 * DependencyTracker — Blueprint version links + asset dependency graph.
 * Marks outdated assets when Blueprint version advances.
 */
export const dependencyTracker = {
  relatedAssets(typeId: AssetTypeId): AssetTypeId[] {
    const def = assetRegistry.get(typeId);
    const deps = def?.dependencies.map((d) => d.assetTypeId) ?? [];
    const dependents = assetRegistry
      .list()
      .filter((a) => a.dependencies.some((d) => d.assetTypeId === typeId))
      .map((a) => a.id);
    return [...new Set([...deps, ...dependents])];
  },

  /**
   * When Blueprint changes, mark generated assets not on the new version as outdated.
   */
  markOutdatedForBlueprintVersion(
    workspace: GenerationWorkspaceDocument,
    newBlueprintVersionId: string,
  ): GenerationWorkspaceDocument {
    const assets = { ...workspace.assets };
    for (const typeId of Object.keys(assets) as AssetTypeId[]) {
      const asset = assets[typeId];
      if (
        asset.status === "completed" &&
        asset.sourceBlueprintVersionId &&
        asset.sourceBlueprintVersionId !== newBlueprintVersionId
      ) {
        assets[typeId] = {
          ...asset,
          outdated: true,
          status: "needs_update",
        };
      }
    }
    return {
      ...workspace,
      assets,
      approvedBlueprintVersionId: newBlueprintVersionId,
      updatedAt: new Date().toISOString(),
    };
  },

  resolveOutdated(
    asset: GeneratedAsset,
    decision: "keep" | "update" | "regenerate",
  ): GeneratedAsset {
    if (decision === "keep") {
      return { ...asset, outdated: false, status: "completed" };
    }
    // update / regenerate — caller queues generation
    return { ...asset, outdated: true, status: "needs_update" };
  },
};
