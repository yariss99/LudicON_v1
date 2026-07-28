import { ASSET_CATALOG, ASSET_TYPE_IDS } from "../constants";
import type {
  AssetLiveStatus,
  AssetTypeDefinition,
  AssetTypeId,
  GeneratedAsset,
} from "../types";

/**
 * AssetRegistry — catalog of generatable assets.
 * Future assets in ASSET_CATALOG appear automatically.
 */
export const assetRegistry = {
  list(): AssetTypeDefinition[] {
    return ASSET_CATALOG;
  },

  get(typeId: AssetTypeId): AssetTypeDefinition | undefined {
    return ASSET_CATALOG.find((asset) => asset.id === typeId);
  },

  createEmptyAsset(typeId: AssetTypeId): GeneratedAsset {
    return {
      typeId,
      status: "not_generated",
      pipelineStage: null,
      lastGeneratedAt: null,
      currentVersionId: null,
      versions: [],
      sourceBlueprintVersionId: null,
      sourceBlueprintVersionLabel: null,
      streamingText: "",
      errorMessage: null,
      outdated: false,
      selectedScope: "entire_asset",
    };
  },

  createAssetMap(): Record<AssetTypeId, GeneratedAsset> {
    const map = {} as Record<AssetTypeId, GeneratedAsset>;
    for (const id of ASSET_TYPE_IDS) {
      map[id] = this.createEmptyAsset(id);
    }
    return map;
  },

  statusLabel(status: AssetLiveStatus): string {
    return status.replace(/_/g, " ");
  },
};
