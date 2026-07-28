import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherProfile } from "../../../data/workspaceData";
import { generationRepository } from "../../generation-workspace/services/generationRepository";
import { assetVersionManager } from "../../generation-workspace/services/assetVersionManager";
import { dependencyTracker } from "../../generation-workspace/services/dependencyTracker";
import { assetRegistry } from "../../generation-workspace/services/assetRegistry";
import type { AssetTypeId } from "../../generation-workspace/types";
import { studioOrchestrator } from "../services/studioOrchestrator";
import type { AssetStudioDocument, ExportFormat } from "../types";

export function useAssetStudio() {
  const { workspaceId = "", assetTypeId = "" } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<AssetStudioDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const structure = useMemo(
    () => (doc ? studioOrchestrator.structure(doc) : []),
    [doc],
  );

  const selectedNode = useMemo(
    () => doc?.nodes.find((n) => n.id === doc.selectedNodeId) ?? null,
    [doc],
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    const workspace = generationRepository.getById(workspaceId);
    if (!workspace) {
      setDoc(null);
      setLoading(false);
      setError("Pregătirea materialelor nu a fost găsită.");
      return;
    }

    const typeId = assetTypeId as AssetTypeId;
    const asset = workspace.assets[typeId];
    if (!asset || asset.status === "not_generated" || !asset.currentVersionId) {
      setDoc(null);
      setLoading(false);
      setError(
        "Pregătește mai întâi materialul, apoi îl poți deschide pentru editare.",
      );
      return;
    }

    const definition = assetRegistry.get(typeId);
    const opened = studioOrchestrator.open({
      workspaceId: workspace.id,
      blueprintId: workspace.blueprintId,
      assetTypeId: typeId,
      title: `${definition?.title ?? typeId} · ${workspace.title}`,
      blueprintVersionId: workspace.approvedBlueprintVersionId,
      blueprintVersionLabel: workspace.approvedBlueprintVersionLabel,
      blueprintSnapshot: workspace.blueprintSnapshot,
      blocks: assetVersionManager.currentBlocks(asset),
      relatedAssetTypeIds: dependencyTracker.relatedAssets(typeId),
      author: teacherProfile.fullName,
    });

    setDoc(opened);
    setLoading(false);
  }, [assetTypeId, workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectNode = useCallback(
    (nodeId: string) => {
      if (!doc) return;
      setDoc(studioOrchestrator.selectNode(doc, nodeId));
    },
    [doc],
  );

  const updateBody = useCallback(
    (body: string) => {
      if (!doc?.selectedNodeId) return;
      setDoc(studioOrchestrator.updateNodeBody(doc, doc.selectedNodeId, body));
    },
    [doc],
  );

  const updateKind = useCallback(
    (kind: NonNullable<typeof selectedNode>["kind"]) => {
      if (!doc?.selectedNodeId) return;
      setDoc(studioOrchestrator.updateNodeKind(doc, doc.selectedNodeId, kind));
    },
    [doc],
  );

  const save = useCallback(() => {
    if (!doc) return;
    setDoc(studioOrchestrator.saveRevision(doc));
  }, [doc]);

  const requestCommand = useCallback(() => {
    if (!doc || !commandInput.trim()) return;
    const result = studioOrchestrator.requestSmartCommand(
      doc,
      commandInput.trim(),
    );
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDoc(result);
    setCommandInput("");
  }, [commandInput, doc]);

  const approveCommand = useCallback(() => {
    if (!doc) return;
    setDoc(studioOrchestrator.decideSmartCommand(doc, true));
  }, [doc]);

  const rejectCommand = useCallback(() => {
    if (!doc) return;
    setDoc(studioOrchestrator.decideSmartCommand(doc, false));
  }, [doc]);

  const addComment = useCallback(() => {
    if (!doc?.selectedNodeId || !commentInput.trim()) return;
    setDoc(
      studioOrchestrator.addComment(
        doc,
        doc.selectedNodeId,
        commentInput.trim(),
      ),
    );
    setCommentInput("");
  }, [commentInput, doc]);

  const resolveComment = useCallback(
    (commentId: string) => {
      if (!doc) return;
      setDoc(studioOrchestrator.resolveComment(doc, commentId));
    },
    [doc],
  );

  const restore = useCallback(
    (revisionId: string) => {
      if (!doc) return;
      const result = studioOrchestrator.restoreRevision(doc, revisionId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDoc(result);
    },
    [doc],
  );

  const duplicate = useCallback(() => {
    if (!doc) return;
    setDoc(studioOrchestrator.duplicate(doc));
  }, [doc]);

  const branch = useCallback(() => {
    if (!doc) return;
    setDoc(studioOrchestrator.branch(doc, "Teacher branch"));
  }, [doc]);

  const exportAsset = useCallback(
    (format: ExportFormat) => {
      if (!doc) return;
      const result = studioOrchestrator.export(doc, format);
      if (!result.available) {
        setExportNotice("SCORM export is a future placeholder.");
        return;
      }
      // Browser download when available
      if (typeof window !== "undefined" && result.content) {
        const blob = new Blob([result.content], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      setExportNotice(`Exported ${result.filename}`);
    },
    [doc],
  );

  const alignmentDecision = useCallback(
    (issueId: string, decision: "keep" | "revise" | "update_blueprint") => {
      if (!doc) return;
      const result = studioOrchestrator.resolveAlignment(doc, issueId, decision);
      if ("blueprintReview" in result) {
        navigate(`/blueprint/review/${result.blueprintId}`);
        return;
      }
      setDoc(result);
    },
    [doc, navigate],
  );

  return {
    doc,
    loading,
    error,
    exportNotice,
    structure,
    selectedNode,
    commandInput,
    setCommandInput,
    commentInput,
    setCommentInput,
    selectNode,
    updateBody,
    updateKind,
    save,
    requestCommand,
    approveCommand,
    rejectCommand,
    addComment,
    resolveComment,
    restore,
    duplicate,
    branch,
    exportAsset,
    alignmentDecision,
    backToGeneration: () => {
      if (!doc) {
        navigate(-1);
        return;
      }
      // Prefer blueprint-linked generation route
      navigate(`/generation/${doc.blueprintId}`);
    },
  };
}
