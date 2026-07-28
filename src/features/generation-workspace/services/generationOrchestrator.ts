import type { BlueprintReviewDocument } from "../../blueprint-review/types";
import { DEFAULT_STAGE_DELAY_MS, PIPELINE_STAGES } from "../constants";
import type {
  AssetTypeId,
  GeneratedAsset,
  GenerationProgressEvent,
  GenerationWorkspaceDocument,
  PipelineStage,
  RegenerationScope,
} from "../types";
import { assetRegistry } from "./assetRegistry";
import { generateAssetBlocks, streamPreview } from "./contentGenerator";
import { evaluateQuality } from "./qualityEvaluator";
import { assetVersionManager } from "./assetVersionManager";
import { queueManager } from "./queueManager";
import { dependencyTracker } from "./dependencyTracker";
import { generationRepository } from "./generationRepository";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type GenerationRuntimeOptions = {
  stageDelayMs?: number;
  onProgress?: (event: GenerationProgressEvent) => void;
  /** Force failure after a stage for tests */
  failAtStage?: PipelineStage;
};

/**
 * GenerationOrchestrator — Blueprint-first asset production studio.
 * Never generates without an approved Blueprint document.
 */
export const generationOrchestrator = {
  assertApproved(doc: BlueprintReviewDocument): string | null {
    if (
      doc.lifecycleState !== "approved" ||
      !doc.generationUnlocked ||
      doc.approvalState !== "frozen"
    ) {
      return "Confirmă proiectul lecției înainte de a pregăti materialele.";
    }
    if (!doc.approvalEvent?.versionId) {
      return "Versiunea confirmată a proiectului lecției lipsește.";
    }
    return null;
  },

  openFromApprovedBlueprint(
    review: BlueprintReviewDocument,
  ): GenerationWorkspaceDocument | { error: string } {
    const gate = this.assertApproved(review);
    if (gate) return { error: gate };

    const existing = generationRepository.getByBlueprintId(review.id);
    const approvedVersionId = review.approvalEvent!.versionId;
    const approvedLabel = review.approvalEvent!.versionLabel;

    if (existing) {
      let workspace = existing;
      if (existing.approvedBlueprintVersionId !== approvedVersionId) {
        workspace = dependencyTracker.markOutdatedForBlueprintVersion(
          {
            ...existing,
            blueprintSnapshot: structuredClone(review.blueprint),
            approvedBlueprintVersionLabel: approvedLabel,
            title: review.title,
            projectId: review.projectId,
          },
          approvedVersionId,
        );
      }
      return generationRepository.save(workspace);
    }

    const workspace: GenerationWorkspaceDocument = {
      id: uid("gws"),
      blueprintId: review.id,
      projectId: review.projectId,
      title: review.title,
      approvedBlueprintVersionId: approvedVersionId,
      approvedBlueprintVersionLabel: approvedLabel,
      blueprintSnapshot: structuredClone(review.blueprint),
      assets: assetRegistry.createAssetMap(),
      queue: [],
      selectedAssetTypeId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return generationRepository.save(workspace);
  },

  selectAsset(
    workspace: GenerationWorkspaceDocument,
    typeId: AssetTypeId | null,
  ): GenerationWorkspaceDocument {
    return generationRepository.save({
      ...workspace,
      selectedAssetTypeId: typeId,
      updatedAt: new Date().toISOString(),
    });
  },

  enqueue(
    workspace: GenerationWorkspaceDocument,
    typeId: AssetTypeId,
    scope: RegenerationScope = "entire_asset",
    scopeTarget?: string,
  ): GenerationWorkspaceDocument {
    const assets = { ...workspace.assets };
    assets[typeId] = {
      ...assets[typeId],
      status: "queued",
      pipelineStage: "queued",
      selectedScope: scope,
      errorMessage: null,
    };

    return generationRepository.save({
      ...workspace,
      assets,
      queue: queueManager.enqueue(workspace.queue, typeId, scope, scopeTarget),
      selectedAssetTypeId: typeId,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Process one queued item through the visible pipeline.
   */
  async processNext(
    workspace: GenerationWorkspaceDocument,
    options: GenerationRuntimeOptions = {},
  ): Promise<GenerationWorkspaceDocument> {
    const delay = options.stageDelayMs ?? DEFAULT_STAGE_DELAY_MS;
    const next = queueManager.next(workspace.queue);
    if (!next) return workspace;

    let queue = queueManager.markGenerating(workspace.queue, next.id);
    let assets = { ...workspace.assets };
    let asset: GeneratedAsset = {
      ...assets[next.assetTypeId],
      status: "generating",
      pipelineStage: "queued",
      streamingText: "",
      errorMessage: null,
    };
    assets[next.assetTypeId] = asset;

    let current: GenerationWorkspaceDocument = {
      ...workspace,
      queue,
      assets,
      selectedAssetTypeId: next.assetTypeId,
    };

    const previousBlocks = assetVersionManager.currentBlocks(asset);

    try {
      for (const stage of PIPELINE_STAGES) {
        if (options.failAtStage === stage) {
          throw new Error(`Forced failure at ${stage}`);
        }

        asset = {
          ...asset,
          status: stage === "available" ? "completed" : "generating",
          pipelineStage: stage,
        };

        if (stage === "preparing") {
          asset.streamingText = "Pregătim materialele din proiectul lecției…";
        }

        if (stage === "generating") {
          const blocks = generateAssetBlocks({
            typeId: next.assetTypeId,
            blueprint: current.blueprintSnapshot,
            scope: next.scope,
            scopeTarget: next.scopeTarget,
            previousBlocks,
          });
          asset.streamingText = streamPreview(blocks);
          // stash blocks on a temp field via streaming completion later
          (asset as GeneratedAssetWithDraft).draftBlocks = blocks;
        }

        if (stage === "reviewing") {
          asset.streamingText = `${asset.streamingText}\n\n— Verificăm împreună alinierea…`;
        }

        assets = { ...assets, [next.assetTypeId]: asset };
        current = { ...current, assets, queue };
        options.onProgress?.({
          assetTypeId: next.assetTypeId,
          stage,
          streamingText: asset.streamingText,
          status: asset.status,
        });

        await sleep(delay);

        if (stage === "available") {
          const draftBlocks =
            (asset as GeneratedAssetWithDraft).draftBlocks ??
            generateAssetBlocks({
              typeId: next.assetTypeId,
              blueprint: current.blueprintSnapshot,
              scope: next.scope,
              scopeTarget: next.scopeTarget,
              previousBlocks,
            });
          const quality = evaluateQuality({
            typeId: next.assetTypeId,
            blueprint: current.blueprintSnapshot,
            blocks: draftBlocks,
          });
          const created = assetVersionManager.createVersion({
            asset,
            blocks: draftBlocks,
            quality,
            blueprintVersionId: current.approvedBlueprintVersionId,
            blueprintVersionLabel: current.approvedBlueprintVersionLabel,
            scope: next.scope,
          });
          asset = created.asset;
          assets = { ...assets, [next.assetTypeId]: asset };
          queue = queueManager.markDone(queue, next.id, "completed");
          current = {
            ...current,
            assets,
            queue,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Nu am putut pregăti materialul. Hai să încercăm din nou.";
      asset = assetVersionManager.markFailed(asset, message);
      // Preserve prior version — never lose successful work
      assets = { ...assets, [next.assetTypeId]: asset };
      queue = queueManager.markDone(queue, next.id, "failed");
      current = {
        ...current,
        assets,
        queue,
        updatedAt: new Date().toISOString(),
      };
    }

    return generationRepository.save(current);
  },

  async processQueue(
    workspace: GenerationWorkspaceDocument,
    options: GenerationRuntimeOptions = {},
  ): Promise<GenerationWorkspaceDocument> {
    let current = workspace;
    let guard = 0;
    while (queueManager.next(current.queue) && guard < 40) {
      current = await this.processNext(current, options);
      guard += 1;
    }
    return current;
  },

  async generate(
    workspace: GenerationWorkspaceDocument,
    typeId: AssetTypeId,
    scope: RegenerationScope = "entire_asset",
    scopeTarget?: string,
    options?: GenerationRuntimeOptions,
  ): Promise<GenerationWorkspaceDocument> {
    const queued = this.enqueue(workspace, typeId, scope, scopeTarget);
    return this.processQueue(queued, options);
  },

  keepOutdated(
    workspace: GenerationWorkspaceDocument,
    typeId: AssetTypeId,
  ): GenerationWorkspaceDocument {
    const assets = { ...workspace.assets };
    assets[typeId] = dependencyTracker.resolveOutdated(assets[typeId], "keep");
    return generationRepository.save({ ...workspace, assets });
  },

  load(id: string): GenerationWorkspaceDocument | null {
    return generationRepository.getById(id);
  },

  loadByBlueprint(blueprintId: string): GenerationWorkspaceDocument | null {
    return generationRepository.getByBlueprintId(blueprintId);
  },
};

type GeneratedAssetWithDraft = {
  draftBlocks?: ReturnType<typeof generateAssetBlocks>;
};
