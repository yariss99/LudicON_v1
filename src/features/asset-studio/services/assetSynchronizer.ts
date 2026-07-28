import type { GeneratedBlock } from "../../generation-workspace/types";
import type { AssetStudioDocument, StudioNode } from "../types";

/**
 * AssetSynchronizer — keeps Blueprint relationship and generation linkage intact.
 * Studio edits never erase Blueprint origin metadata.
 */
export const assetSynchronizer = {
  nodesToBlocks(nodes: StudioNode[]): GeneratedBlock[] {
    return nodes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((node) => ({
        id: node.id,
        title: node.title,
        body: node.body,
        sourceSections: [...node.sourceSections],
      }));
  },

  /**
   * Ensures Blueprint linkage fields remain present after any mutation.
   */
  preserveBlueprintLink(
    doc: AssetStudioDocument,
    patch: Partial<AssetStudioDocument>,
  ): AssetStudioDocument {
    return {
      ...doc,
      ...patch,
      blueprintId: doc.blueprintId,
      blueprintVersionId: doc.blueprintVersionId,
      blueprintVersionLabel: doc.blueprintVersionLabel,
      blueprintSnapshot: doc.blueprintSnapshot,
      assetTypeId: doc.assetTypeId,
      workspaceId: doc.workspaceId,
      updatedAt: new Date().toISOString(),
    };
  },

  relatedSummary(doc: AssetStudioDocument): string[] {
    return doc.relatedAssetTypeIds.map((id) => id.replace(/_/g, " "));
  },
};
