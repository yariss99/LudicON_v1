import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blueprintReviewRepository } from "../../blueprint-review";
import { ASSET_CATALOG } from "../constants";
import { generationOrchestrator } from "../services/generationOrchestrator";
import { assetRegistry } from "../services/assetRegistry";
import type {
  AssetTypeId,
  GenerationWorkspaceDocument,
  RegenerationScope,
  WorkspaceUiState,
} from "../types";

export function useGenerationWorkspace() {
  const { blueprintId = "" } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] =
    useState<GenerationWorkspaceDocument | null>(null);
  const [uiState, setUiState] = useState<WorkspaceUiState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDefinition = useMemo(() => {
    if (!workspace?.selectedAssetTypeId) return null;
    return assetRegistry.get(workspace.selectedAssetTypeId) ?? null;
  }, [workspace]);

  const selectedAsset = useMemo(() => {
    if (!workspace?.selectedAssetTypeId) return null;
    return workspace.assets[workspace.selectedAssetTypeId] ?? null;
  }, [workspace]);

  const load = useCallback(async () => {
    setUiState("loading");
    setError(null);

    if (!blueprintId) {
      setUiState("empty");
      return;
    }

    const review = blueprintReviewRepository.getById(blueprintId);
    if (!review) {
      setUiState("empty");
      return;
    }

    const gate = generationOrchestrator.assertApproved(review);
    if (gate) {
      setUiState("redirect_review");
      navigate(`/blueprint/review/${blueprintId}`, { replace: true });
      return;
    }

    const opened = generationOrchestrator.openFromApprovedBlueprint(review);
    if ("error" in opened) {
      setError(opened.error);
      setUiState("redirect_review");
      navigate(`/blueprint/review/${blueprintId}`, { replace: true });
      return;
    }

    setWorkspace(opened);
    setUiState("ready");
  }, [blueprintId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectAsset = useCallback(
    (typeId: AssetTypeId) => {
      if (!workspace) return;
      setWorkspace(generationOrchestrator.selectAsset(workspace, typeId));
    },
    [workspace],
  );

  const generate = useCallback(
    async (typeId: AssetTypeId, scope: RegenerationScope = "entire_asset") => {
      if (!workspace) return;
      setBusy(true);
      setError(null);
      try {
        const next = await generationOrchestrator.generate(
          workspace,
          typeId,
          scope,
          scope === "selected_section" ? "section" : undefined,
          {
            stageDelayMs: 90,
            onProgress: (event) => {
              setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  selectedAssetTypeId: event.assetTypeId,
                  assets: {
                    ...prev.assets,
                    [event.assetTypeId]: {
                      ...prev.assets[event.assetTypeId],
                      status: event.status,
                      pipelineStage: event.stage,
                      streamingText: event.streamingText,
                    },
                  },
                };
              });
            },
          },
        );
        setWorkspace(next);
      } catch {
        setError("Generation interrupted. Previous successful versions were kept.");
      } finally {
        setBusy(false);
      }
    },
    [workspace],
  );

  const keepOutdated = useCallback(() => {
    if (!workspace?.selectedAssetTypeId) return;
    setWorkspace(
      generationOrchestrator.keepOutdated(
        workspace,
        workspace.selectedAssetTypeId,
      ),
    );
  }, [workspace]);

  return {
    workspace,
    uiState,
    busy,
    error,
    catalog: ASSET_CATALOG,
    selectedDefinition,
    selectedAsset,
    selectAsset,
    generate,
    keepOutdated,
    regenerateSelected: () => {
      if (!workspace?.selectedAssetTypeId) return;
      void generate(workspace.selectedAssetTypeId, "entire_asset");
    },
    clearError: () => setError(null),
    retry: load,
  };
}
