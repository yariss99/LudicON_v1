import type {
  AssetVersion,
  GeneratedAsset,
  GeneratedBlock,
  QualityReport,
  RegenerationScope,
} from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Asset VersionManager — preserves lineage; keeps last successful version on failure.
 */
export const assetVersionManager = {
  nextLabel(asset: GeneratedAsset): string {
    return `g${asset.versions.length + 1}.0`;
  },

  createVersion(input: {
    asset: GeneratedAsset;
    blocks: GeneratedBlock[];
    quality: QualityReport;
    blueprintVersionId: string;
    blueprintVersionLabel: string;
    scope: RegenerationScope;
  }): { asset: GeneratedAsset; version: AssetVersion } {
    const version: AssetVersion = {
      id: uid("gav"),
      versionLabel: this.nextLabel(input.asset),
      createdAt: new Date().toISOString(),
      blueprintVersionId: input.blueprintVersionId,
      blueprintVersionLabel: input.blueprintVersionLabel,
      scope: input.scope,
      blocks: input.blocks,
      quality: input.quality,
      pipelineStage: "available",
      preserved: true,
    };

    // Previous successful versions remain preserved
    const versions = [
      version,
      ...input.asset.versions.map((v) => ({ ...v, preserved: true })),
    ];

    const asset: GeneratedAsset = {
      ...input.asset,
      versions,
      currentVersionId: version.id,
      lastGeneratedAt: version.createdAt,
      sourceBlueprintVersionId: input.blueprintVersionId,
      sourceBlueprintVersionLabel: input.blueprintVersionLabel,
      status: "completed",
      pipelineStage: "available",
      outdated: false,
      errorMessage: null,
      streamingText: "",
    };

    return { asset, version };
  },

  /**
   * On failure — keep previous successful version; mark failed without deleting work.
   */
  markFailed(asset: GeneratedAsset, message: string): GeneratedAsset {
    return {
      ...asset,
      status: asset.versions.length > 0 ? "completed" : "failed",
      pipelineStage: asset.versions.length > 0 ? "available" : null,
      errorMessage: message,
      streamingText: "",
      // Restore pointer to last good version if any
      currentVersionId:
        asset.currentVersionId ?? asset.versions[0]?.id ?? null,
    };
  },

  currentBlocks(asset: GeneratedAsset): GeneratedBlock[] {
    const current = asset.versions.find((v) => v.id === asset.currentVersionId);
    return current?.blocks ?? asset.versions[0]?.blocks ?? [];
  },
};
